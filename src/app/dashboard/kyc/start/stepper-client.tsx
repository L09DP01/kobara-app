'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DocumentCapture } from "@/components/kyc/DocumentCapture";
import { SelfieCapture } from "@/components/kyc/SelfieCapture";
import { LivenessCheck } from "@/components/kyc/LivenessCheck";
import { Loader2 } from "lucide-react";

// For Desktop Handoff we could use a real QR code library (like qrcode.react)
// For MVP, we'll just show a message. Ideally we'd use a package.
import { QRCodeSVG } from 'qrcode.react';

export function KycStepperClient() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [documentType, setDocumentType] = useState('national_id');
  const [isDesktop, setIsDesktop] = useState(false);
  const [handoffUrl, setHandoffUrl] = useState('');

  // Liveness State
  const [livenessChallengeId, setLivenessChallengeId] = useState('');
  const [livenessInstruction, setLivenessInstruction] = useState('');

  useEffect(() => {
    // Basic detection for Desktop
    if (window.innerWidth > 1024 || !(/Mobi|Android/i.test(navigator.userAgent))) {
      setIsDesktop(true);
      const url = new URL(window.location.href);
      // We pass a handoff flag if we want
      url.searchParams.set('handoff', '1');
      setHandoffUrl(url.toString());
    } else {
      setStep(1); // Start flow directly on mobile
    }
  }, []);

  const uploadDocument = async (blob: Blob, side: string) => {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('documentType', documentType);
    formData.append('side', side);

    const res = await fetch('/api/kyc/capture-document', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur lors de l'enregistrement du document");
    }
  };

  const uploadSelfie = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('file', blob);

    const res = await fetch('/api/kyc/capture-selfie', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erreur lors de l'enregistrement du selfie");
    }
  };

  const startLiveness = async () => {
    const res = await fetch('/api/kyc/liveness/start', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur liveness");
    setLivenessChallengeId(data.id);
    setLivenessInstruction(data.instruction);
  };

  const verifyLiveness = async (frames: Blob[]) => {
    const formData = new FormData();
    formData.append('challengeId', livenessChallengeId);
    frames.forEach((f, i) => formData.append(`frame_${i}`, f));

    const res = await fetch('/api/kyc/liveness/verify', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Échec vérification liveness");
  };

  const submitKyc = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kyc/submit', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de soumission");
      
      router.push('/dashboard/kyc'); // Will show pending, approved or rejected status
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const nextStep = (next: number) => {
    setError(null);
    setStep(next);
  };

  if (isDesktop && step === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest h-full border-b border-border-subtle">
        <span className="material-symbols-outlined text-6xl text-primary mb-6">smartphone</span>
        <h2 className="font-headline-md text-text-primary mb-4 text-center">Continuez sur votre téléphone</h2>
        <p className="text-body-base text-text-secondary max-w-md text-center mb-8">
          Pour des raisons de sécurité, la vérification d'identité doit être effectuée depuis un smartphone pour utiliser la caméra arrière. 
          Veuillez scanner ce QR code avec votre téléphone en étant connecté au même réseau WiFi.
        </p>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-subtle mb-6">
          <QRCodeSVG value={handoffUrl} size={200} />
        </div>

        <button onClick={() => { setIsDesktop(false); setStep(1); }} className="text-sm text-text-secondary underline hover:text-text-primary">
          J'ai un ordinateur avec une bonne webcam (non recommandé)
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <h2 className="font-headline-md text-text-primary text-center">Vérification d'identité</h2>
        <div className="flex gap-2 mt-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-surface-container-high'}`} />
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-8 flex-1">
        {error && (
          <div className="mb-6 bg-error-container/20 border border-status-error/30 text-status-error p-4 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <p className="font-body-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-6 max-w-md mx-auto">
            <h3 className="font-headline-sm text-text-primary text-center">Type de document</h3>
            <p className="text-body-sm text-text-secondary text-center mb-6">Préparez votre pièce d'identité officielle.</p>
            
            <div className="space-y-3">
              {[
                { id: 'national_id', label: 'Carte d\'Identité Nationale (CIN)' },
                { id: 'passport', label: 'Passeport' },
                { id: 'driver_license', label: 'Permis de conduire' }
              ].map(doc => (
                <button 
                  key={doc.id}
                  onClick={() => setDocumentType(doc.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-colors flex items-center gap-3 ${documentType === doc.id ? 'border-primary bg-primary/5 text-primary' : 'border-border-subtle bg-surface-container-low text-text-primary hover:border-primary/50'}`}
                >
                  <span className="material-symbols-outlined">{doc.id === 'passport' ? 'import_contacts' : 'id_card'}</span>
                  <span className="font-medium">{doc.label}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => nextStep(2)}
              className="w-full mt-6 px-6 py-3 bg-primary text-on-primary rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              Commencer la capture
            </button>
          </div>
        )}

        {/* Step 2: Document Front / Passport */}
        {step === 2 && (
          <div className="space-y-6">
            <DocumentCapture 
              documentType={documentType}
              side={documentType === 'passport' ? 'passport_page' : 'front'}
              onCaptureComplete={async (blob) => {
                try {
                  await uploadDocument(blob, documentType === 'passport' ? 'passport_page' : 'front');
                  if (documentType === 'passport') {
                    nextStep(4); // Skip back for passport
                  } else {
                    nextStep(3); // Go to back capture
                  }
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            />
          </div>
        )}

        {/* Step 3: Document Back */}
        {step === 3 && documentType !== 'passport' && (
          <div className="space-y-6">
            <DocumentCapture 
              documentType={documentType}
              side="back"
              onCaptureComplete={async (blob) => {
                try {
                  await uploadDocument(blob, 'back');
                  nextStep(4);
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            />
          </div>
        )}

        {/* Step 4: Selfie */}
        {step === 4 && (
          <div className="space-y-6">
            <SelfieCapture 
              onCaptureComplete={async (blob) => {
                try {
                  await uploadSelfie(blob);
                  await startLiveness();
                  nextStep(5);
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            />
          </div>
        )}

        {/* Step 5: Liveness */}
        {step === 5 && (
          <div className="space-y-6">
            <LivenessCheck 
              challengeId={livenessChallengeId}
              instruction={livenessInstruction}
              onVerifyComplete={async (frames) => {
                try {
                  await verifyLiveness(frames);
                  nextStep(6);
                  submitKyc(); // Auto submit when done
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            />
          </div>
        )}

        {/* Step 6: Review / Submitting */}
        {step === 6 && (
          <div className="space-y-6 text-center py-12">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <h3 className="font-headline-md text-text-primary">Analyse en cours</h3>
            <p className="text-body-base text-text-secondary max-w-sm mx-auto">
              Notre système sécurisé analyse vos documents. Veuillez patienter quelques instants...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
