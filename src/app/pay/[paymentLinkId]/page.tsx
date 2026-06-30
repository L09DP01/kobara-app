import { createAdminClient } from "@/utils/supabase/admin";
import { notFound, redirect } from "next/navigation";
import { processPayment } from "./actions";
import { getMerchantCurrentPlan } from "@/lib/server/plans";
import PaymentFormClient from "@/components/payments/PaymentFormClient";
import { ShieldCheck, Zap, HeadphonesIcon, Lock } from "lucide-react";

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
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col md:flex-row font-sans text-white">
      {/* Colonne de Gauche : Récapitulatif (Sidebar) */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-[#0F1626] border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-10 flex flex-col relative z-10 shrink-0">
        
        {/* En-tête / Logo */}
        <div className="mb-8 md:mb-12 flex items-center justify-center md:justify-start w-full">
          <div className="flex items-center gap-2">
            <img src="/Icone.png" alt="Icone Kobara" className="w-8 h-8 object-contain rounded" />
            <span className="text-xl font-bold tracking-tight text-white">KOBARA</span>
          </div>
        </div>

        {/* Bouton retour (masqué pour le moment selon la consigne, ou on peut l'afficher conditionnellement si un success_url existe) */}
        {link.success_url && (
          <a href={link.success_url} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium mb-12 transition-colors w-fit">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Retour à la boutique
          </a>
        )}

        <div className="flex-1">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Récapitulatif de la commande</h2>
          
          {/* Carte Produit (Affichée uniquement s'il y a un nom ou une image) */}
          {(link.metadata?.product_name || link.metadata?.product_image || link.title) && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-4 mb-8">
              {link.metadata?.product_image && (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10">
                  <img src={link.metadata.product_image} alt="Produit" className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-white text-base leading-tight mb-1">
                  {link.metadata?.product_name || link.title}
                </h3>
                {link.description && (
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-3">
                    {link.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="bg-white/10 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">x1</span>
                  <span className="text-orange-400 font-bold text-sm">
                    {link.amount ? `${Number(link.amount).toLocaleString('fr-FR')} HTG` : 'Variable'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sous-total et Frais */}
          <div className="space-y-4 mb-8 hidden md:block">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Sous-total</span>
              <span className="font-medium">{link.amount ? `${Number(link.amount).toLocaleString('fr-FR')} HTG` : '---'}</span>
            </div>
            
            {/* Afficher les frais si le marchand les applique au client */}
            {link.metadata?.pass_fees_to_customer && (
              <div className="flex justify-between items-center text-sm group relative">
                <span className="text-slate-400 flex items-center gap-1 cursor-help border-b border-dashed border-slate-600">
                  Frais de transaction
                  <span className="material-symbols-outlined text-[14px]">info</span>
                </span>
                <span className="font-medium text-slate-300">+2.9%</span>
                
                <div className="absolute left-0 bottom-6 w-48 bg-black/90 text-xs text-slate-300 p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  Les frais de réseau sont à votre charge sur cette transaction.
                </div>
              </div>
            )}
            
            {/* Si option livraison est activée, on peut afficher une ligne Frais de livraison */}
            {link.metadata?.collect_address && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1">
                  Frais de livraison
                  <span className="material-symbols-outlined text-[14px] text-slate-500">info</span>
                </span>
                <span className="font-medium">{link.metadata?.shipping_fee ? `${Number(link.metadata.shipping_fee).toLocaleString('fr-FR')} HTG` : '0 HTG'}</span>
              </div>
            )}
          </div>

          <div className="h-px w-full bg-white/5 mb-6 hidden md:block" />

          {/* Total */}
          <div className="hidden md:flex justify-between items-end mb-12">
            <span className="text-white font-bold text-base">Total à payer</span>
            <div className="text-right">
              <span className="text-orange-500 font-black text-2xl tracking-tight">
                {link.amount ? `${(Number(link.amount) + (link.metadata?.shipping_fee ? Number(link.metadata.shipping_fee) : 0)).toLocaleString('fr-FR')} HTG` : '---'}
              </span>
            </div>
          </div>
        </div>

        {/* Badges de Réassurance */}
        <div className="space-y-6 mt-auto hidden md:block">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
              <ShieldCheck size={20} className="text-orange-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Paiement 100% sécurisé</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Vos informations sont protégées et chiffrées de bout en bout.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
              <Zap size={20} className="text-orange-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Traitement instantané</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Confirmation immédiate de votre paiement MonCash/NatCash.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
              <HeadphonesIcon size={20} className="text-orange-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-0.5">Support 24/7</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Notre équipe est disponible à tout moment pour vous aider.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-xs text-slate-500 hidden md:block">
          © {new Date().getFullYear()} Kobara. Tous droits réservés.
        </div>
      </div>

      {/* Colonne de Droite : Formulaire (Main Content) */}
      <div className="flex-1 bg-[#0A0F1C] relative overflow-y-auto">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none" />
        
        <div className="max-w-4xl mx-auto p-6 md:p-12 lg:p-16">
          <div className="hidden md:flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Paiement sécurisé</h1>
              <p className="text-slate-400 text-sm">Finalisez votre paiement en toute sécurité via MonCash ou NatCash.</p>
            </div>
            <div className="flex items-center gap-2 bg-[#0F1626] border border-white/10 px-4 py-2.5 rounded-lg shrink-0">
              <Lock size={14} className="text-orange-500" />
              <div className="text-xs">
                <span className="block font-bold text-white">Paiement sécurisé</span>
                <span className="block text-slate-400 text-[10px]">SSL chiffré 256-bit</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0F1626]/50 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            {/* Header Form : Montant (Optionnel, si on veut le rappeler, mais c'est déjà à gauche) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-white/5 gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Montant à payer</h3>
                <div className="text-orange-500 font-black text-3xl sm:text-4xl tracking-tight">
                  {link.amount ? `${(Number(link.amount) + (link.metadata?.shipping_fee ? Number(link.metadata.shipping_fee) : 0)).toLocaleString('fr-FR')} HTG` : 'Variable'}
                </div>
              </div>
              <div className="text-right flex-1 sm:max-w-[200px]">
                <div className="font-bold text-white truncate">{link.merchants?.business_name}</div>
                <div className="text-xs text-slate-400 truncate">Paiement marchand</div>
              </div>
            </div>

            {/* Client Component for Interactive Form */}
            <PaymentFormClient link={link} processPaymentAction={processPayment} />
          </div>
        </div>
      </div>
    </div>
  );
}
