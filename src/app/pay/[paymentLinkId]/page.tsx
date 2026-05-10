import { createAdminClient } from "@/utils/supabase/admin";
import { notFound, redirect } from "next/navigation";
import { processPayment } from "./actions";

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
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-card border border-border-subtle rounded-2xl p-8 text-center shadow-lg ambient-shadow">
          <div className="w-16 h-16 bg-status-warning/10 text-status-warning rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-text-primary mb-2">Lien invalide</h1>
          <p className="text-text-secondary font-body-base">
            Ce lien de paiement est expiré ou a été désactivé par le marchand.
          </p>
        </div>
      </div>
    );
  }

  if (resolvedSearchParams.status === 'success') {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-card border border-border-subtle rounded-2xl p-8 text-center shadow-lg ambient-shadow">
          <div className="w-16 h-16 bg-status-success/10 text-status-success rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <h1 className="text-headline-md font-headline-md text-text-primary mb-2">Paiement réussi</h1>
          <p className="text-text-secondary font-body-base">
            Merci pour votre paiement. La transaction a été complétée avec succès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-card border border-border-subtle rounded-2xl overflow-hidden shadow-lg ambient-shadow">
        <div className="bg-surface-container-low p-6 border-b border-border-subtle text-center">
          {link.merchants?.logo_url ? (
            <img src={link.merchants.logo_url} alt={link.merchants.business_name} className="w-16 h-16 object-cover rounded-full mx-auto mb-4 border border-border-subtle" />
          ) : (
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 font-headline-md">
              {link.merchants?.business_name?.substring(0, 1).toUpperCase() || 'K'}
            </div>
          )}
          <h2 className="text-text-secondary font-body-sm font-medium uppercase tracking-wider">{link.merchants?.business_name || 'Kobara Merchant'}</h2>
          <h1 className="text-headline-sm font-headline-sm text-text-primary mt-2">{link.title}</h1>
          {link.description && (
            <p className="text-text-secondary font-body-sm mt-2">{link.description}</p>
          )}
        </div>
        
        <div className="p-6">
          <form action={processPayment} className="space-y-5">
            <input type="hidden" name="paymentLinkId" value={link.id} />
            <input type="hidden" name="merchantId" value={link.merchant_id} />
            
            {!link.amount && (
              <div className="space-y-1.5">
                <label htmlFor="amount" className="block text-body-sm font-medium text-text-primary">Montant (HTG) *</label>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount" 
                  required
                  step="0.01"
                  min="10"
                  placeholder="Saisissez le montant"
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg text-body-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            )}

            {link.amount && (
              <input type="hidden" name="amount" value={link.amount} />
            )}

            <div className="space-y-1.5">
              <label htmlFor="customerName" className="block text-body-sm font-medium text-text-primary">Nom complet *</label>
              <input 
                type="text" 
                id="customerName" 
                name="customerName" 
                required
                placeholder="Jean Dupont"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg text-body-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="customerPhone" className="block text-body-sm font-medium text-text-primary">Téléphone MonCash *</label>
              <input 
                type="tel" 
                id="customerPhone" 
                name="customerPhone" 
                required
                placeholder="ex: 37000000"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-border-subtle rounded-lg text-body-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-body-base font-medium hover:opacity-90 transition-opacity shadow-md flex justify-center items-center gap-2 mt-4"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              Payer {link.amount ? `${Number(link.amount).toLocaleString('fr-FR')} HTG` : ''}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-4 text-text-secondary text-xs">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span>Paiement sécurisé par MonCash & Kobara</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
