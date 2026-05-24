export interface KycSignals {
  email_verified: boolean;
  phone_verified: boolean;
  document_type: string;
  document_required_sides_present: boolean;
  document_quality_score: number;
  document_expired: boolean;
  ocr_score: number;
  name_match_score: number;
  selfie_present: boolean;
  face_detected: boolean;
  face_match_score: number;
  liveness_score: number;
  duplicate_document: boolean;
  duplicate_phone: boolean;
  duplicate_selfie: boolean;
  risk_score: number;
  gemini_review: {
    risk_level?: string;
    recommended_status?: string;
    observations?: string[];
    inconsistencies?: string[];
  };
}

export interface KycDecision {
  status: 'approved' | 'in_review' | 'rejected';
  score: number;
  reasons: string[];
}

export function decideKycStatus(signals: KycSignals): KycDecision {
  const reasons: string[] = [];
  let score = 0;

  // 1. REJECTED DIRECT (Bloquants)
  if (!signals.email_verified) reasons.push("Email non vérifié");
  if (!signals.phone_verified) reasons.push("Téléphone non vérifié");
  if (!signals.document_required_sides_present) reasons.push("Document incomplet (faces manquantes)");
  if (!signals.selfie_present) reasons.push("Selfie manquant");
  if (signals.document_expired) reasons.push("Document expiré");
  if (signals.duplicate_document) reasons.push("Document déjà utilisé par un autre compte");
  if (signals.liveness_score < 50) reasons.push("Échec critique du test de preuve de vie (liveness)");
  if (signals.face_match_score < 50) reasons.push("Le visage ne correspond pas au document");

  if (reasons.length > 0) {
    return { status: 'rejected', score: 0, reasons };
  }

  // 2. SCORING
  if (signals.email_verified) score += 10;
  if (signals.phone_verified) score += 10;
  if (signals.document_required_sides_present) score += 10;
  if (signals.document_quality_score >= 80) score += 15;
  if (signals.ocr_score >= 80) score += 10;
  if (signals.name_match_score >= 80) score += 10;
  if (signals.face_match_score >= 80) score += 20;
  if (signals.liveness_score >= 80) score += 20;
  if (!signals.duplicate_document) score += 5;

  // 3. IN_REVIEW DIRECT
  let needsReview = false;
  if (signals.document_quality_score < 70) { needsReview = true; reasons.push("Qualité du document insuffisante"); }
  if (signals.ocr_score < 70) { needsReview = true; reasons.push("Lecture du texte OCR difficile"); }
  if (signals.name_match_score < 70) { needsReview = true; reasons.push("Correspondance du nom incertaine"); }
  if (signals.liveness_score >= 50 && signals.liveness_score < 80) { needsReview = true; reasons.push("Preuve de vie douteuse"); }
  if (signals.face_match_score >= 50 && signals.face_match_score < 80) { needsReview = true; reasons.push("Correspondance faciale incertaine"); }
  if (signals.risk_score >= 60) { needsReview = true; reasons.push("Score de risque élevé"); }
  
  if (signals.gemini_review) {
    if (signals.gemini_review.recommended_status === 'rejected') {
      reasons.push(`Les documents fournis sont invalides, illisibles ou ne correspondent pas à une pièce d'identité officielle.`);
      return { status: 'rejected', score: 0, reasons };
    }
    if (signals.gemini_review.risk_level === 'high' || signals.gemini_review.risk_level === 'critical') {
      needsReview = true; 
      reasons.push(`Risque ${signals.gemini_review.risk_level} signalé lors de l'analyse automatique`);
    }
    if (signals.gemini_review.recommended_status === 'in_review') {
      needsReview = true;
      reasons.push(`Vérification manuelle requise suite à l'analyse automatique`);
    }
  }

  if (needsReview) {
    return { status: 'in_review', score, reasons };
  }

  // 4. APPROVED
  if (score >= 85) {
    return { status: 'approved', score, reasons: ["Toutes les vérifications sont validées"] };
  } else if (score >= 60) {
    return { status: 'in_review', score, reasons: ["Score global insuffisant pour approbation automatique (60-84)"] };
  } else {
    return { status: 'rejected', score, reasons: ["Score global insuffisant (<60)"] };
  }
}
