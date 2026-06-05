import { getKycStatus } from "./actions";
import Link from "next/link";
import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { redirect } from "next/navigation";

export default async function KycPage() {
  const { merchant, userRole } = await getCurrentUserAndMerchant();
  if (!merchant) redirect('/login');

  if (userRole !== 'owner') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center max-w-md">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">lock</span>
          <h2 className="text-xl font-bold text-white mb-2">Accès restreint</h2>
          <p className="text-slate-400">Seul le propriétaire du compte peut accéder à la page de vérification KYC.</p>
        </div>
      </div>
    );
  }

  const profile = await getKycStatus();
  const status = profile?.status || 'not_started';

  const steps = [
    { label: 'Informations', icon: 'person' },
    { label: 'Documents', icon: 'description' },
    { label: 'Vérification', icon: 'search' },
    { label: 'Approuvé', icon: 'verified' },
  ];

  const getStepState = (index: number) => {
    if (status === 'approved') return 'completed';
    if (status === 'in_review' && index <= 1) return 'completed';
    if (status === 'in_review' && index === 2) return 'active';
    if (status === 'not_started' && index === 0) return 'active';
    if (status === 'rejected' && index <= 1) return 'completed';
    if (status === 'rejected' && index === 2) return 'error';
    return 'upcoming';
  };

  return (
    <div className="max-w-[800px] w-full mx-auto pb-12 space-y-8">
      {/* Progress Stepper */}
      <div className="bg-white/5 border border-white/10 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-white/10"></div>
          <div className="absolute top-5 left-[10%] h-0.5 bg-green-500 transition-all duration-500" style={{ 
            width: status === 'approved' ? '80%' : status === 'in_review' ? '53%' : status === 'rejected' ? '53%' : '0%' 
          }}></div>
          {steps.map((step, i) => {
            const state = getStepState(i);
            return (
              <div key={i} className="flex flex-col items-center relative z-10 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  state === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  state === 'active' ? 'bg-orange-500 border-orange-500 text-white animate-pulse' :
                  state === 'error' ? 'bg-red-500 border-red-500 text-white' :
                  'bg-white/5 border-white/10 text-slate-400'
                }`}>
                  {state === 'completed' ? (
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  ) : state === 'error' ? (
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  )}
                </div>
                <span className={`text-[11px] font-semibold mt-2 ${
                  state === 'completed' ? 'text-green-500' :
                  state === 'active' ? 'text-orange-500' :
                  state === 'error' ? 'text-red-500' :
                  'text-slate-400'
                }`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/5 border border-white/10 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Vérification d'Identité (KYC)</h1>
        <p className="text-sm text-slate-400 mb-8">
          Pour accepter des paiements réels et retirer vos fonds, vous devez vérifier votre identité. Ce processus prend moins de 5 minutes.
        </p>

        {status === 'not_started' && (
          <div className="bg-transparent border border-white/10 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-5">Ce dont vous aurez besoin :</h3>
            <div className="space-y-4 mb-8">
              {[
                { icon: 'badge', text: "Une pièce d'identité valide (CIN, Passeport, ou Permis de conduire)", num: '1' },
                { icon: 'photo_camera', text: "Un appareil avec une caméra pour un court selfie vidéo (Liveness)", num: '2' },
                { icon: 'lightbulb', text: "Un environnement bien éclairé", num: '3' },
              ].map(item => (
                <div key={item.num} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-orange-500">{item.icon}</span>
                  </div>
                  <div>
                    <span className="text-xs text-orange-500 font-bold">Étape {item.num}</span>
                    <p className="text-sm text-slate-400 mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/kyc/start"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-sm hover:shadow-md"
            >
              Commencer la vérification
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        )}

        {status === 'in_review' && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-amber-500 animate-pulse">hourglass_empty</span>
            </div>
            <h3 className="text-lg font-bold text-amber-400 mb-2">En cours de vérification</h3>
            <p className="text-sm text-amber-500 max-w-md mx-auto mb-6">
              Vos documents ont bien été reçus. Notre équipe les analyse actuellement.
            </p>
            {/* Timeline */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="text-xs text-amber-400 font-medium">Documents reçus</span>
              </div>
              <div className="w-8 h-0.5 bg-amber-500/30"></div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs text-amber-400 font-medium">En analyse</span>
              </div>
              <div className="w-8 h-0.5 bg-amber-500/30"></div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/5"></span>
                <span className="text-xs text-amber-500">Décision</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-[16px] text-amber-400">schedule</span>
              <span className="text-xs font-semibold text-amber-400">Délai estimé : 24-48h</span>
            </div>
          </div>
        )}

        {status === 'approved' && (
          <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-xl text-center relative overflow-hidden">
            <div className="absolute top-2 left-4 text-4xl opacity-20">🎉</div>
            <div className="absolute top-6 right-8 text-3xl opacity-20">✨</div>
            <div className="absolute bottom-4 left-12 text-2xl opacity-20">🎊</div>
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 mx-auto flex items-center justify-center mb-4 relative z-10">
              <span className="material-symbols-outlined text-4xl text-green-400">verified</span>
            </div>
            <h3 className="text-lg font-bold text-green-400 mb-2">Compte Vérifié !</h3>
            <p className="text-sm text-green-500 max-w-md mx-auto mb-4">
              Félicitations, votre identité a été confirmée. Vous pouvez désormais accepter des paiements en mode Live et effectuer des retraits.
            </p>
            <span className="inline-flex items-center gap-1.5 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Mode Live Activé
            </span>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-red-500">cancel</span>
            </div>
            <h3 className="text-lg font-bold text-red-400 mb-2">Vérification Échouée</h3>
            <p className="text-sm text-red-500 max-w-md mx-auto mb-4">
              {profile.rejection_reason || "Vos documents n'ont pas pu être vérifiés."}
            </p>
            <div className="bg-white/5 rounded-xl p-4 max-w-sm mx-auto mb-6 text-left space-y-2">
              <p className="text-xs font-semibold text-red-400">Pour réessayer :</p>
              <div className="flex items-start gap-2 text-xs text-red-400"><span className="font-bold">1.</span> Vérifiez que le document est lisible</div>
              <div className="flex items-start gap-2 text-xs text-red-400"><span className="font-bold">2.</span> Assurez-vous que tous les coins sont visibles</div>
              <div className="flex items-start gap-2 text-xs text-red-400"><span className="font-bold">3.</span> Utilisez un éclairage suffisant</div>
            </div>
            <Link 
              href="/kyc/start"
              className="inline-flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Recommencer la vérification
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
