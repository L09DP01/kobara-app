'use client'

import { useState, useRef } from "react";
import { uploadKycDocument } from "../actions";
import { useRouter } from "next/navigation";

export function KycStepperClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [documentType, setDocumentType] = useState('national_id');
  const [documentCountry, setDocumentCountry] = useState('HT');
  const [fullName, setFullName] = useState('');
  
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [livenessInstruction, setLivenessInstruction] = useState("Veuillez regarder la caméra et sourire");

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Impossible d'accéder à la caméra. Veuillez autoriser l'accès.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          setSelfieImage(file);
          stopCamera();
          setStep(4); // Move to review
        }
      }, 'image/jpeg');
    }
  };

  const handleSubmit = async () => {
    if (!frontImage || !selfieImage || !fullName) {
      setError("Informations incomplètes.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('front', frontImage);
    if (backImage) formData.append('back', backImage);
    formData.append('selfie', selfieImage);

    try {
      const res = await uploadKycDocument(formData, documentType, documentCountry, fullName);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push('/dashboard/kyc'); // Will show pending or approved status
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-surface-container-lowest p-6 border-b border-border-subtle">
        <h2 className="font-headline-md text-text-primary">Vérification d'identité - Étape {step} sur 4</h2>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-surface-container-high'}`} />
          ))}
        </div>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 bg-error-container/20 border border-status-error/30 text-status-error p-4 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <p className="font-body-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-headline-sm text-text-primary">Informations du document</h3>
            <div>
              <label className="block text-body-sm text-text-secondary mb-2">Nom complet (exactement comme sur le document)</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Jean Dupont"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Type de document</label>
                <select 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="national_id">Carte d'Identité Nationale (CIN)</option>
                  <option value="passport">Passeport</option>
                  <option value="driver_license">Permis de conduire</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm text-text-secondary mb-2">Pays d'émission</label>
                <select 
                  value={documentCountry}
                  onChange={(e) => setDocumentCountry(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="HT">Haïti</option>
                  <option value="US">États-Unis</option>
                  <option value="CA">Canada</option>
                  <option value="FR">France</option>
                  <option value="DO">Rép. Dominicaine</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => { if(fullName) setStep(2); else setError("Veuillez entrer votre nom complet"); }}
              className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-headline-sm text-text-primary">Photos du document</h3>
            <p className="text-body-sm text-text-secondary">Veuillez télécharger des photos claires et lisibles (Formats: JPG, PNG, WEBP, PDF - Max 5Mo).</p>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border-subtle p-6 rounded-xl text-center bg-surface-container-lowest">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">id_card</span>
                <p className="font-medium text-text-primary mb-2">Recto du document (Obligatoire)</p>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                  className="w-full max-w-xs mx-auto block text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                {frontImage && <p className="text-status-success text-sm mt-2 font-medium">✓ Fichier sélectionné : {frontImage.name}</p>}
              </div>

              <div className="border-2 border-dashed border-border-subtle p-6 rounded-xl text-center bg-surface-container-lowest">
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">credit_card</span>
                <p className="font-medium text-text-primary mb-2">Verso du document (Optionnel)</p>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                  className="w-full max-w-xs mx-auto block text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-surface-container-high file:text-text-primary hover:file:bg-surface-container-highest cursor-pointer"
                />
                {backImage && <p className="text-status-success text-sm mt-2 font-medium">✓ Fichier sélectionné : {backImage.name}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="px-6 py-2 bg-surface-container-high text-text-primary rounded-lg font-medium hover:bg-surface-container-highest">Retour</button>
              <button 
                onClick={() => {
                  if(!frontImage) setError("Le recto du document est obligatoire");
                  else {
                    setError(null);
                    setStep(3);
                    startCamera();
                  }
                }} 
                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Selfie & Liveness */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-headline-sm text-text-primary">Test de vivacité (Liveness) & Selfie</h3>
            <p className="text-body-sm text-text-secondary">Assurez-vous que votre visage est bien éclairé et au centre du cadre.</p>
            
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 overflow-hidden relative">
              <div className="bg-primary text-on-primary font-medium text-center py-2 px-4 rounded-lg mb-4 shadow-sm z-10 relative">
                {livenessInstruction}
              </div>
              
              <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-black rounded-full overflow-hidden border-4 border-primary/20">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={() => { stopCamera(); setStep(2); }} className="px-6 py-2 bg-surface-container-high text-text-primary rounded-lg font-medium">Retour</button>
              <button 
                onClick={captureSelfie} 
                className="px-8 py-3 bg-primary text-on-primary rounded-full font-medium shadow-md flex items-center gap-2 hover:opacity-90"
              >
                <span className="material-symbols-outlined">photo_camera</span>
                Capturer
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="font-headline-md text-text-primary">Prêt à soumettre</h3>
            <p className="text-body-base text-text-secondary max-w-md mx-auto">
              Vos documents et votre selfie ont été capturés avec succès. Cliquez sur "Soumettre" pour lancer la vérification.
            </p>
            
            <div className="flex justify-center gap-4 mt-8">
              <button onClick={() => { setSelfieImage(null); setStep(3); startCamera(); }} className="px-6 py-2 text-text-secondary underline font-medium">Refaire le selfie</button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-primary text-on-primary rounded-lg font-medium shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    Soumettre la vérification
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
