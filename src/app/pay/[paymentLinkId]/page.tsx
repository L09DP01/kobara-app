import { createAdminClient } from "@/utils/supabase/admin";
import { notFound, redirect } from "next/navigation";
import { processPayment } from "./actions";
import { getMerchantCurrentPlan } from "@/lib/server/plans";
import { CheckCircle2 } from "lucide-react";

export default async function PublicPaymentPage({ params, searchParams }: { params: Promise<{ paymentLinkId: string }>, searchParams: Promise<{ status?: string }> }) {
  const supabaseAdmin = createAdminClient();
  
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Search by slug first, then by id
  let link = null;
  
  const { data: linkBySlug } = await supabaseAdmin
    .from('payment_links')
    .select('*, merchants(business_name, logo_url)')
    .eq('slug', resolvedParams.paymentLinkId)
    .single();

  if (linkBySlug) {
    link = linkBySlug;
  } else {
    const { data: linkById } = await supabaseAdmin
      .from('payment_links')
      .select('*, merchants(business_name, logo_url)')
      .eq('id', resolvedParams.paymentLinkId)
      .single();
    
    if (linkById) {
      link = linkById;
    }
  }

  if (!link) {
    notFound();
  }

  // Check if link is active
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
  if (link.status !== 'active' || isExpired) {
    return (
      <div className="min-h-[100dvh] bg-[#0F1626] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-lg ambient-shadow">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-white mb-2">Lien invalide</h1>
          <p className="text-slate-400 font-body-base">
            Ce lien de paiement est expiré ou a été désactivé par le marchand.
          </p>
        </div>
      </div>
    );
  }

  if (resolvedSearchParams.status === 'success') {
    return (
      <div className="min-h-[100dvh] bg-[#0F1626] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center shadow-lg ambient-shadow">
          <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-white mb-2">Paiement réussi</h1>
          <p className="text-slate-400 font-body-base">
            Merci pour votre paiement. La transaction a été complétée avec succès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0F1626] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg ambient-shadow">
        <div className="bg-black/20 p-6 border-b border-white/10 text-center">
          {link.merchants?.logo_url ? (
            <img src={link.merchants.logo_url} alt={link.merchants.business_name} className="w-16 h-16 object-cover rounded-full mx-auto mb-4 border border-white/10" />
          ) : (
            <div className="w-16 h-16 bg-orange-500/10 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 font-headline-md">
              {link.merchants?.business_name?.substring(0, 1).toUpperCase() || 'K'}
            </div>
          )}
          <h2 className="text-slate-400 font-body-sm font-medium uppercase tracking-wider">{link.merchants?.business_name || 'Kobara Merchant'}</h2>
          <h1 className="text-headline-sm font-headline-sm text-white mt-2">{link.title}</h1>
          {link.description && (
            <p className="text-slate-400 font-body-sm mt-2">{link.description}</p>
          )}
        </div>
        
        <div className="p-6">
          {link.metadata?.pass_fees_to_customer && (
            <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-blue-400 text-[18px] mt-0.5">info</span>
              <div>
                <p className="text-xs text-blue-400 font-medium">Frais de transaction applicables</p>
                <p className="text-xs text-blue-400/80 mt-0.5">Les frais de traitement réseau seront ajoutés au montant de base lors du paiement.</p>
              </div>
            </div>
          )}
          <form action={processPayment} className="space-y-5">
            <input type="hidden" name="paymentLinkId" value={link.id} />
            <input type="hidden" name="merchantId" value={link.merchant_id} />
            
            {!link.amount && (
              <div className="space-y-1.5">
                <label htmlFor="amount" className="block text-body-sm font-medium text-white">Montant (HTG) *</label>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount" 
                  required
                  step="0.01"
                  min="10"
                  placeholder="Saisissez le montant"
                  className="w-full px-4 py-2.5 bg-[#0F1626] border border-white/10 rounded-lg text-body-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            )}

            {link.amount && (
              <input type="hidden" name="amount" value={link.amount} />
            )}

            <div className="space-y-1.5">
              <label htmlFor="customerName" className="block text-body-sm font-medium text-white">Nom complet *</label>
              <input 
                type="text" 
                id="customerName" 
                name="customerName" 
                required
                placeholder="Jean Dupont"
                className="w-full px-4 py-2.5 bg-[#0F1626] border border-white/10 rounded-lg text-body-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="customerPhone" className="block text-body-sm font-medium text-white">Téléphone MonCash *</label>
              <input 
                type="tel" 
                id="customerPhone" 
                name="customerPhone" 
                required
                placeholder="ex: 37000000"
                className="w-full px-4 py-2.5 bg-[#0F1626] border border-white/10 rounded-lg text-body-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-body-sm font-medium text-white mb-2">Méthode de paiement *</label>
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

            {link.metadata?.collect_address && (
              <div className="space-y-1.5">
                <label htmlFor="customerAddress" className="block text-body-sm font-medium text-white">Adresse de livraison *</label>
                <textarea 
                  id="customerAddress" 
                  name="customerAddress" 
                  required
                  rows={2}
                  placeholder="Votre adresse complète"
                  className="w-full px-4 py-2.5 bg-[#0F1626] border border-white/10 rounded-lg text-body-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                ></textarea>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-body-base font-medium hover:opacity-90 transition-opacity shadow-md flex justify-center items-center gap-2 mt-4"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Continuer vers le paiement {link.amount ? `${Number(link.amount).toLocaleString('fr-FR')} HTG` : ''}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-400 text-xs">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span>Paiement sécurisé par MonCash & Kobara</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
