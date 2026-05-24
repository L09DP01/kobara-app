import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { decideKycStatus, KycSignals } from "@/lib/server/kyc/decision-engine";
import { activateFreePlanAfterKyc } from "@/lib/server/plans";
import { createNotification } from "@/lib/server/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data: merchant } = await supabase.from('merchants').select('id, email, phone').eq('user_id', session.user.id).single();
    if (!merchant) return NextResponse.json({ error: "Marchand introuvable" }, { status: 404 });
    const merchantId = merchant.id;

    const { data: profile } = await supabase.from('kyc_profiles').select('*').eq('merchant_id', merchantId).single();
    if (!profile) {
      return NextResponse.json({ error: "Profil KYC incomplet" }, { status: 400 });
    }

    // Prepare signals for Decision Engine
    let geminiReview = {};
    const geminiKey = process.env.GEMINI_API_KEY;
    
    // Check missing docs
    const missingDocs = !profile.document_front_url || !profile.selfie_url || (!profile.document_back_url && profile.document_type === 'national_id');

    if (!missingDocs && geminiKey) {
      // Fetch files to send to Gemini for review
      try {
        const { data: frontData } = await supabase.storage.from('kyc_documents').download(profile.document_front_url);
        const { data: selfieData } = await supabase.storage.from('kyc_documents').download(profile.selfie_url);
        
        let backData = null;
        if (profile.document_back_url) {
          const { data: bData } = await supabase.storage.from('kyc_documents').download(profile.document_back_url);
          backData = bData;
        }

        if (frontData && selfieData) {
          const frontBase64 = Buffer.from(await frontData.arrayBuffer()).toString('base64');
          const selfieBase64 = Buffer.from(await selfieData.arrayBuffer()).toString('base64');
          
          const parts = [
            { text: `Tu es un assistant d’analyse KYC pour Kobara.
Tu n’es pas l’autorité finale.
Tu ne peux pas approuver ou rejeter un utilisateur.
Tu analyses seulement les signaux fournis et tu retournes un JSON strict.
Ne demande jamais de secrets.
Ne donne jamais une décision finale.
Retourne uniquement :
{
  "risk_level": "low|medium|high|critical",
  "recommended_status": "approved|in_review|rejected",
  "confidence": 0.0,
  "observations": [],
  "inconsistencies": [],
  "missing_checks": [],
  "admin_summary": "",
  "suggested_next_steps": []
}` },
            { inline_data: { mime_type: "image/jpeg", data: frontBase64 } },
            { inline_data: { mime_type: "image/jpeg", data: selfieBase64 } }
          ];

          if (backData) {
            const backBase64 = Buffer.from(await backData.arrayBuffer()).toString('base64');
            parts.push({ inline_data: { mime_type: "image/jpeg", data: backBase64 } });
          }

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts }] })
          });

          const json = await response.json();
          if (json.candidates && json.candidates[0].content.parts[0].text) {
            let text = json.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
            geminiReview = JSON.parse(text);
          }
        }
      } catch (err) {
        console.error("Gemini Assistant Error:", err);
      }
    }

    // Call Decision Engine
    const signals: KycSignals = {
      email_verified: !!merchant.email,
      phone_verified: !!merchant.phone,
      document_type: profile.document_type || 'unknown',
      document_required_sides_present: !missingDocs,
      document_quality_score: 85, // Mocked for MVP, should be returned by OCR/Vision
      document_expired: false,
      ocr_score: 85,
      name_match_score: 85,
      selfie_present: !!profile.selfie_url,
      face_detected: true,
      face_match_score: 85, // Gemini could provide this in real life, mocked here
      liveness_score: profile.liveness_score || 0,
      duplicate_document: false,
      duplicate_phone: false,
      duplicate_selfie: false,
      risk_score: 0,
      gemini_review: geminiReview
    };

    const decision = decideKycStatus(signals);

    // Prepare update
    const updatePayload: any = {
      status: decision.status,
      gemini_review: geminiReview,
      backend_decision: decision,
      risk_score: decision.score,
      rejection_reason: decision.reasons.join(' | ')
    };

    if (decision.status === 'approved') updatePayload.approved_at = new Date().toISOString();
    else if (decision.status === 'rejected') updatePayload.rejected_at = new Date().toISOString();

    // 1. Update KYC Profile
    await supabase.from('kyc_profiles').update(updatePayload).eq('id', profile.id);

    // 2. Update Merchant Status
    await supabase.from('merchants').update({
      kyc_status: decision.status,
      ...(decision.status === 'approved' ? { kyc_verified_at: new Date().toISOString() } : {})
    }).eq('id', merchantId);

    // 3. Post-Decision Actions
    if (decision.status === 'approved') {
      try {
         await activateFreePlanAfterKyc(merchantId);
      } catch (e) {
         console.error("Erreur activation plan gratuit:", e);
      }
      await createNotification(merchantId, 'kyc_success', 'Vérification validée', 'Votre identité a été confirmée avec succès.', merchant.email);
    } else if (decision.status === 'in_review') {
      await createNotification(merchantId, 'kyc_review', 'Vérification en cours', 'Votre dossier est en cours d\'examen manuel par nos équipes.', merchant.email);
    } else {
      await createNotification(merchantId, 'kyc_rejected', 'Échec de la vérification', `Votre vérification a échoué: ${decision.reasons.join(', ')}`, merchant.email);
    }

    // Audit Log
    await supabase.from('kyc_events').insert({
      merchant_id: merchantId,
      kyc_profile_id: profile.id,
      event_type: `kyc.${decision.status}`,
      payload: { decision, signals }
    });

    return NextResponse.json({ success: true, status: decision.status, reasons: decision.reasons });

  } catch (error) {
    console.error("Submit KYC error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
