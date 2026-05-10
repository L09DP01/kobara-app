import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updatePaymentLink } from "../../actions";

export default async function EditPaymentLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const resolvedParams = await params;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify the link belongs to the merchant
  const { data: link } = await supabase
    .from('payment_links')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (!link) {
    redirect('/dashboard/payment-links');
  }

  return (
    <div className="max-w-[800px] mx-auto w-full space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-body-sm text-text-secondary mb-2">
            <Link href="/dashboard/payment-links" className="hover:text-text-primary transition-colors">Liens de Paiement</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-text-primary font-medium">Modifier</span>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Modifier le lien de paiement</h1>
        </div>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm p-6">
        <form action={updatePaymentLink} className="space-y-6">
          <input type="hidden" name="id" value={link.id} />
          
          <div className="space-y-2">
            <label htmlFor="title" className="block text-body-sm font-medium text-text-primary">Titre du paiement *</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required
              defaultValue={link.title}
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
              defaultValue={link.amount || ''}
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
              defaultValue={link.description || ''}
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
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
