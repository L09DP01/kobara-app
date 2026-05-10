import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LinkActions from "./LinkActions";

export default async function PaymentLinksPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch current merchant
  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!merchant) {
    redirect('/login');
  }

  // Fetch payment links
  const { data: paymentLinks } = await supabase
    .from('payment_links')
    .select('*')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  // Fetch payments to calculate stats per link
  const { data: payments } = await supabase
    .from('payments')
    .select('payment_link_id, amount, status')
    .eq('merchant_id', merchant.id)
    .eq('status', 'succeeded')
    .not('payment_link_id', 'is', null);

  // Calculate totals
  let totalLinkRevenue = 0;
  const linkStats: Record<string, { count: number, total: number }> = {};
  
  if (payments) {
    payments.forEach(p => {
      if (p.payment_link_id) {
        if (!linkStats[p.payment_link_id]) {
          linkStats[p.payment_link_id] = { count: 0, total: 0 };
        }
        linkStats[p.payment_link_id].count++;
        linkStats[p.payment_link_id].total += Number(p.amount);
        totalLinkRevenue += Number(p.amount);
      }
    });
  }

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Liens de Paiement</h1>
          <p className="text-text-secondary text-body-sm mt-1">Créez et gérez vos liens de paiement partageables.</p>
        </div>
        <Link 
          href="/dashboard/payment-links/create"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-body-base text-body-sm font-medium hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Créer un lien de paiement
        </Link>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden ambient-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-lowest border-b border-border-subtle">
              <tr>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Lien</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Montant</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Ventes</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Statut</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Créé le</th>
                <th className="py-4 px-6 text-right font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border-subtle">
              {paymentLinks && paymentLinks.length > 0 ? (
                paymentLinks.map(link => {
                  const stats = linkStats[link.id] || { count: 0, total: 0 };
                  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
                  let statusLabel = link.status === 'active' && !isExpired ? 'Actif' : isExpired ? 'Expiré' : 'Inactif';
                  let statusStyles = link.status === 'active' && !isExpired 
                    ? 'bg-status-success/10 text-status-success border-status-success/20 bg-status-success'
                    : 'bg-status-warning/10 text-status-warning border-status-warning/20 bg-status-warning';

                  return (
                    <tr key={link.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-medium text-text-primary">{link.title}</div>
                        <div className="text-text-secondary text-xs flex items-center gap-1 mt-1 cursor-pointer hover:text-secondary transition-colors">
                          <span className="material-symbols-outlined text-[14px]">link</span>
                          {`${process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:3000'}/pay/${link.slug || link.id}`}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium">{Number(link.amount).toLocaleString('fr-FR')} {link.currency}</div>
                        <div className="text-text-secondary text-xs">Paiement {link.amount ? 'unique' : 'ouvert'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium">{stats.count}</div>
                        <div className="text-status-success text-xs">{stats.total.toLocaleString('fr-FR')} {link.currency}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusStyles.split(' ').slice(0, 3).join(' ')}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusStyles.split(' ')[3]}`}></span>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        <div>{new Date(link.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <LinkActions 
                          linkId={link.id} 
                          linkUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${link.slug || link.id}`} 
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    Aucun lien de paiement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {paymentLinks && paymentLinks.length > 0 && (
          <div className="px-6 py-4 border-t border-border-subtle bg-surface-container-lowest flex items-center justify-between">
            <p className="font-body-sm text-text-secondary">Affichage de 1 à {paymentLinks.length} sur {paymentLinks.length} liens</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-border-subtle rounded text-body-sm font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50" disabled>Précédent</button>
              <button className="px-3 py-1 border border-border-subtle rounded text-body-sm font-medium text-text-primary hover:bg-surface-container transition-colors disabled:opacity-50" disabled>Suivant</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
