import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function PaymentDetailsPage(props: { params: Params }) {
  const params = await props.params;
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', params.id)
    .eq('merchant_id', merchant.id)
    .single();

  if (error) {
    console.error("Error fetching payment details:", error);
  }

  if (!payment) {
    console.log("Payment not found for ID:", params.id, "and merchant:", merchant.id);
    notFound();
  }

  let customer = null;
  if (payment.customer_id) {
    const { data: cData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', payment.customer_id)
      .single();
    customer = cData;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-success/10 text-status-success"><span className="w-2 h-2 rounded-full mr-2 bg-status-success"></span>Succès</span>;
      case 'pending':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-warning/10 text-status-warning"><span className="w-2 h-2 rounded-full mr-2 bg-status-warning"></span>En attente</span>;
      case 'failed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-status-error/10 text-status-error"><span className="w-2 h-2 rounded-full mr-2 bg-status-error"></span>Échoué</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-surface-container-high text-text-secondary">{status}</span>;
    }
  };

  return (
    <div className="max-w-[1080px] w-full mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/payments" className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-text-secondary hover:text-text-primary">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Détails de la transaction</h1>
          <p className="text-text-secondary text-body-sm mt-1">{payment.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-6 shadow-sm ambient-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-text-secondary text-body-sm mb-1">Montant Brut</p>
                <h2 className="text-display-md font-display-md text-text-primary">{Number(payment.gross_amount || payment.amount).toLocaleString('fr-FR')} {payment.currency}</h2>
              </div>
              {getStatusBadge(payment.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border-subtle">
              <div>
                <p className="text-text-secondary text-body-sm mb-1">Frais Kobara</p>
                <p className="font-medium text-text-primary text-body-base">-{Number(payment.fee_amount || 0).toLocaleString('fr-FR')} {payment.currency}</p>
              </div>
              <div>
                <p className="text-text-secondary text-body-sm mb-1">Montant Net</p>
                <p className="font-medium text-status-success text-body-base">+{Number(payment.net_amount || payment.amount).toLocaleString('fr-FR')} {payment.currency}</p>
              </div>
            </div>
          </div>

          {/* Timeline / Additional details */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-6 shadow-sm ambient-shadow">
            <h3 className="font-headline-sm text-text-primary mb-4">Informations Système</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border-subtle/50">
                <span className="text-text-secondary text-body-sm">Date de création</span>
                <span className="font-medium text-text-primary text-body-sm">{new Date(payment.created_at).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle/50">
                <span className="text-text-secondary text-body-sm">Méthode de paiement</span>
                <span className="font-medium text-text-primary text-body-sm capitalize">{payment.payment_method || payment.provider || 'Moncash'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary text-body-sm">Référence Kobara</span>
                <span className="font-mono-code text-text-primary text-body-sm">{payment.transaction_reference || payment.kobara_reference || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer Card */}
          <div className="bg-surface-card rounded-xl border border-border-subtle p-6 shadow-sm ambient-shadow">
            <h3 className="font-headline-sm text-text-primary mb-4">Client</h3>
            {customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary font-medium uppercase">
                    {customer.name ? customer.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{customer.name || 'Client Inconnu'}</p>
                    {customer.email && <p className="text-text-secondary text-body-sm">{customer.email}</p>}
                  </div>
                </div>
                {customer.phone && (
                  <div className="pt-3 flex items-center gap-2 text-text-secondary text-body-sm">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    {customer.phone}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-text-secondary text-body-sm">Aucun client rattaché à ce paiement.</p>
            )}
          </div>
          
          <button className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-container transition-colors shadow-sm text-status-error">
            <span className="material-symbols-outlined text-[18px]">currency_exchange</span>
            Rembourser
          </button>
        </div>
      </div>
    </div>
  );
}
