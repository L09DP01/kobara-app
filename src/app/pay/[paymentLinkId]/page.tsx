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
    <div className="min-h-[100dvh] bg-[#0A0F1C] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] -z-10 mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen" />

      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="bg-black/20 p-8 border-b border-white/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-50" />
          
          <div className="relative z-10">
            {link.metadata?.product_image && (
              <img 
                src={link.metadata.product_image} 
                alt={link.metadata?.product_name || link.title} 
                className="w-full h-48 object-cover rounded-2xl mb-6 shadow-lg border border-white/10" 
              />
            )}

            <div className="flex items-center justify-center gap-3 mb-4">
              {link.merchants?.logo_url ? (
                <img src={link.merchants.logo_url} alt={link.merchants.business_name} className="w-10 h-10 object-cover rounded-full border border-white/10 shadow-sm" />
              ) : (
                <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-orange-500/20">
                  {link.merchants?.business_name?.substring(0, 1).toUpperCase() || 'K'}
                </div>
              )}
              <span className="text-slate-300 font-semibold text-sm tracking-wide">{link.merchants?.business_name || 'Kobara Merchant'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 leading-tight">
              {link.metadata?.product_name || link.title}
            </h1>
            {link.description && (
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">{link.description}</p>
            )}
          </div>
        </div>
        
        <div className="p-8">
          {link.metadata?.pass_fees_to_customer && (
            <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3 backdrop-blur-md">
              <span className="material-symbols-outlined text-orange-400 text-[20px] mt-0.5">info</span>
              <div>
                <p className="text-sm text-orange-400 font-semibold">Frais de réseau applicables</p>
                <p className="text-xs text-orange-400/80 mt-1 leading-relaxed">Les frais de traitement (2.9%) seront ajoutés au montant de base lors du paiement.</p>
              </div>
            </div>
          )}
          <form action={processPayment} className="space-y-6">
            <input type="hidden" name="paymentLinkId" value={link.id} />
            <input type="hidden" name="merchantId" value={link.merchant_id} />
            
            {!link.amount && (
              <div className="space-y-2">
                <label htmlFor="amount" className="block text-sm font-semibold text-slate-300">Montant (HTG) *</label>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount" 
                  required
                  step="0.01"
                  min="10"
                  placeholder="0.00"
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-600 shadow-inner"
                />
              </div>
            )}

            {link.amount && (
              <input type="hidden" name="amount" value={link.amount} />
            )}

            <div className="space-y-2">
              <label htmlFor="customerName" className="block text-sm font-semibold text-slate-300">Nom complet *</label>
              <input 
                type="text" 
                id="customerName" 
                name="customerName" 
                required
                placeholder="Ex: Jean Dupont"
                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-600 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="customerPhone" className="block text-sm font-semibold text-slate-300">Téléphone MonCash *</label>
              <input 
                type="tel" 
                id="customerPhone" 
                name="customerPhone" 
                required
                placeholder="Ex: 37000000"
                className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-600 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 mb-3">Méthode de paiement *</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex flex-col items-center justify-center p-5 cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10 has-[:checked]:shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                  <input type="radio" name="provider" value="moncash" className="sr-only" defaultChecked />
                  <div className="absolute top-3 right-3 opacity-0 group-has-[:checked]:opacity-100 transition-opacity transform scale-75 group-has-[:checked]:scale-100 duration-200">
                    <CheckCircle2 size={18} className="text-orange-500" />
                  </div>
                  <span className="font-bold text-white mt-1 text-base tracking-wide">MonCash</span>
                </label>
                
                <label className="relative flex flex-col items-center justify-center p-5 cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/10 has-[:checked]:shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                  <input type="radio" name="provider" value="natcash" className="sr-only" />
                  <div className="absolute top-3 right-3 opacity-0 group-has-[:checked]:opacity-100 transition-opacity transform scale-75 group-has-[:checked]:scale-100 duration-200">
                    <CheckCircle2 size={18} className="text-orange-500" />
                  </div>
                  <span className="font-bold text-white mt-1 text-base tracking-wide">NatCash</span>
                </label>
              </div>
            </div>

            {link.metadata?.collect_address && (
              <div className="space-y-2">
                <label htmlFor="customerAddress" className="block text-sm font-semibold text-slate-300">Adresse de livraison *</label>
                <textarea 
                  id="customerAddress" 
                  name="customerAddress" 
                  required
                  rows={3}
                  placeholder="Votre adresse complète (rue, ville...)"
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder:text-slate-600 shadow-inner resize-none"
                ></textarea>
              </div>
            )}

            <button 
              type="submit"
              className="w-full relative group overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(249,115,22,0.3)] flex justify-center items-center gap-3 mt-6"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="material-symbols-outlined text-[22px] relative z-10">lock</span>
              <span className="relative z-10">Continuer vers le paiement {link.amount ? `${Number(link.amount).toLocaleString('fr-FR')} HTG` : ''}</span>
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-6 text-slate-500 text-xs font-medium">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Paiement sécurisé de bout en bout</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
