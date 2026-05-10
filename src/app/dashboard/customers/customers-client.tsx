'use client'

export function CustomersClient({ customers }: { customers: any[] }) {
  const getCustomerStats = (customer: any) => {
    const payments = customer.payments || [];
    const totalVolume = payments.reduce((acc: number, p: any) => acc + Number(p.gross_amount || 0), 0);
    
    // Find the latest payment date
    let lastPaymentDate = null;
    if (payments.length > 0) {
      const dates = payments.map((p: any) => new Date(p.created_at).getTime());
      lastPaymentDate = new Date(Math.max(...dates));
    }

    return {
      paymentCount: payments.length,
      totalVolume,
      lastPaymentDate
    };
  };

  return (
    <div className="max-w-[1440px] mx-auto w-full space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-text-primary tracking-tight">Clients</h1>
          <p className="text-text-secondary text-body-sm mt-1">Gérez vos clients et visualisez leur historique de paiement.</p>
        </div>
        <button className="bg-surface-card text-text-primary border border-border-subtle px-5 py-2.5 rounded-lg font-body-base text-body-sm font-medium hover:bg-surface-container transition-colors shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nouveau client
        </button>
      </div>

      <div className="bg-surface-card rounded-xl border border-border-subtle shadow-sm overflow-hidden ambient-shadow">
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm font-body-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" 
              placeholder="Rechercher par nom, email ou téléphone..." 
              type="text"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-border-subtle rounded-lg text-body-sm font-medium text-text-primary hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Exporter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-bright">
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Client</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Téléphone</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Paiements</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Volume Total</th>
                <th className="py-4 px-6 font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Dernier paiement</th>
                <th className="py-4 px-6 text-right font-label-caps text-label-caps text-text-secondary uppercase tracking-wider font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border-subtle">
              {customers.length > 0 ? customers.map((customer) => {
                const stats = getCustomerStats(customer);
                return (
                  <tr key={customer.id} className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                    <td className="py-4 px-6">
                      <div className="font-medium text-text-primary">{customer.name || 'Client Inconnu'}</div>
                      <div className="text-text-secondary text-xs mt-1">{customer.email || 'Aucun email'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-text-secondary">{customer.phone || 'Aucun téléphone'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{stats.paymentCount}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium">HTG {stats.totalVolume.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      <div>{stats.lastPaymentDate ? stats.lastPaymentDate.toLocaleDateString('fr-FR') : 'Aucun'}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-text-secondary hover:text-primary transition-colors font-medium">
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-secondary">
                    Aucun client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border-subtle bg-surface-container-lowest flex items-center justify-between">
          <p className="font-body-sm text-text-secondary">Affichage de {customers.length} clients</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-border-subtle rounded text-body-sm font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-border-subtle rounded text-body-sm font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50" disabled>Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
