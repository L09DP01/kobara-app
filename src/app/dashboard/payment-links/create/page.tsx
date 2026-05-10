import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPaymentLink } from "../actions";

export default async function CreatePaymentLinkPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Vérifier le marchand
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!merchant) {
    const { data: member } = await supabase
      .from('merchant_members')
      .select('merchant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    if (!member) {
      redirect('/login');
    }
  }

  return (
    <div className="max-w-[800px] mx-auto w-full space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-text-secondary mb-2">
            <Link href="/dashboard/payment-links" className="hover:text-text-primary transition-colors">Liens de Paiement</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-text-primary font-medium">Créer</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Créer un lien de paiement</h1>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-6">
        <form action={createPaymentLink} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-body-sm font-medium text-text-primary">Titre du paiement *</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required
              placeholder="ex: Consultation vidéo 1h"
              className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            <p className="text-text-secondary text-xs">Ce que vos clients verront lors du paiement.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="amount" className="block text-body-sm font-medium text-text-primary">Montant (HTG) *</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              required
              step="0.01"
              min="10"
              placeholder="ex: 1500.00"
              className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            <p className="text-text-secondary text-xs">Le montant fixe à payer en Gourdes Haïtiennes.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-body-sm font-medium text-text-primary">Description (Optionnel)</label>
            <textarea 
              id="description" 
              name="description" 
              rows={3}
              placeholder="Détails supplémentaires sur le paiement..."
              className="w-full px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
            <Link 
              href="/dashboard/payment-links"
              className="px-5 py-2.5 rounded-lg font-body-sm font-medium border border-border-subtle text-text-secondary hover:bg-surface-container-low hover:text-text-primary transition-colors"
            >
              Annuler
            </Link>
            <button 
              type="submit"
              className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-body-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              Créer le lien
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
