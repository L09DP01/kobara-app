import { createAdminClient } from "@/utils/supabase/admin";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { processUnifiedCheckout, simulateTestPayment } from "./actions";

export default async function UnifiedCheckoutPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const supabaseAdmin = createAdminClient();
  const resolvedParams = await params;
  
  if (!resolvedParams.paymentId) {
    notFound();
  }

  const { data: payment } = await supabaseAdmin
    .from('payments')
    .select('*, merchants(business_name, logo_url)')
    .eq('id', resolvedParams.paymentId)
    .single();

  if (!payment) {
    notFound();
  }

  // Check if active
  const isExpired = payment.expires_at && new Date(payment.expires_at) < new Date();
  if (payment.status !== 'pending' || isExpired) {
    if (payment.status === 'succeeded' && payment.success_url) {
      redirect(payment.success_url);
    }
    return (
      <div className="min-h-[100dvh] bg-[#0F1626] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-lg ambient-shadow">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-white mb-2">Paiement indisponible</h1>
          <p className="text-slate-400 font-body-base">
            Ce paiement est expiré ou a déjà été traité.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0F1626] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg ambient-shadow">
        <div className="bg-black/20 p-6 border-b border-white/10 text-center">
          {payment.merchants?.logo_url ? (
            <img src={payment.merchants.logo_url} alt={payment.merchants.business_name} className="w-16 h-16 object-cover rounded-full mx-auto mb-4 border border-white/10" />
          ) : (
            <div className="w-16 h-16 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 font-headline-md">
              {payment.merchants?.business_name?.substring(0, 1).toUpperCase() || 'K'}
            </div>
          )}
          <h2 className="text-slate-400 font-body-sm font-medium uppercase tracking-wider">{payment.merchants?.business_name || 'Kobara Merchant'}</h2>
          <h1 className="text-headline-sm font-headline-sm text-white mt-2">Paiement</h1>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
             <div className="text-slate-400 text-sm mb-1">Montant à payer</div>
             <div className="text-3xl font-bold text-white">{Number(payment.amount).toLocaleString('fr-FR')} HTG</div>
          </div>

          {payment.environment === 'test' ? (
            <form action={simulateTestPayment} className="space-y-5">
              <input type="hidden" name="paymentId" value={payment.id} />
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <span className="material-symbols-outlined text-blue-400 text-3xl mb-2">science</span>
                <h3 className="text-blue-400 font-bold mb-1">Mode Test Activé</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Aucun appel API réel ne sera effectué. Vous pouvez simuler le succès de ce paiement.
                </p>
                <button 
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-body-base font-bold hover:bg-blue-600 transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Valider le paiement test
                </button>
              </div>
            </form>
          ) : (
            <form action={processUnifiedCheckout} className="space-y-5">
              <input type="hidden" name="paymentId" value={payment.id} />
              
              <div className="space-y-1.5">
                <label className="block text-body-sm font-medium text-white mb-2">Choisissez votre méthode de paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="relative flex flex-col items-center justify-center p-4 cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10">
                    <input type="radio" name="provider" value="moncash" className="sr-only" defaultChecked />
                    <div className="absolute top-2 right-2 opacity-0 group-has-[:checked]:opacity-100 transition-opacity">
                      <CheckCircle2 size={16} className="text-orange-500" />
                    </div>
                    <span className="font-bold text-white mt-1">MonCash</span>
                  </label>
                  
                  <label className="relative flex flex-col items-center justify-center p-4 cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10">
                    <input type="radio" name="provider" value="natcash" className="sr-only" />
                    <div className="absolute top-2 right-2 opacity-0 group-has-[:checked]:opacity-100 transition-opacity">
                      <CheckCircle2 size={16} className="text-orange-500" />
                    </div>
                    <span className="font-bold text-white mt-1">NatCash</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-body-base font-medium hover:opacity-90 transition-opacity shadow-md flex justify-center items-center gap-2 mt-4"
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
                Confirmer
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 text-xs">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                <span>Paiement sécurisé par Kobara</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
