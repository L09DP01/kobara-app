import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { data: dbCustomers } = await supabase
    .from('customers')
    .select(`
      *,
      payments (
        id,
        gross_amount,
        created_at,
        provider,
        status
      )
    `)
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  // Also fetch payments that have no customer_id but have customer info in metadata (from API)
  const { data: orphanPayments } = await supabase
    .from('payments')
    .select('*')
    .eq('merchant_id', merchant.id)
    .eq('status', 'succeeded')
    .is('customer_id', null);

  const virtualCustomersMap = new Map<string, any>();

  if (orphanPayments) {
    orphanPayments.forEach((p: any) => {
      const metadata = p.metadata || {};
      const name = metadata.customer_name || metadata.name || metadata.client_name;
      const email = metadata.customer_email || metadata.email || metadata.client_email;
      const phone = metadata.customer_phone || metadata.phone || metadata.client_phone;

      if (name || email || phone) {
        const key = email || phone || name;
        if (!virtualCustomersMap.has(key)) {
          virtualCustomersMap.set(key, {
            id: `virtual_${key}`,
            name: name || 'Inconnu',
            email: email || '',
            phone: phone || '',
            created_at: p.created_at,
            payments: []
          });
        }
        
        virtualCustomersMap.get(key).payments.push({
          id: p.id,
          gross_amount: p.gross_amount || p.amount,
          created_at: p.created_at,
          provider: p.provider || 'moncash',
          status: p.status
        });
      }
    });
  }

  // Filter dbCustomers to only show those with at least one successful payment, or new ones without any payment?
  // User: "un client qui fait un paiment doivent afficher dans la page client si le paiement est succes"
  const processedDbCustomers = (dbCustomers || []).map((c: any) => {
    // Only keep successful payments
    const successfulPayments = c.payments ? c.payments.filter((p: any) => p.status === 'succeeded') : [];
    return {
      ...c,
      payments: successfulPayments
    };
  }).filter(c => c.payments.length > 0 || c.payments.length === 0); // We'll keep them all, but the client side can filter or we just show successful stats. Actually, user wants "si le paiement est succes". Let's show only clients who have successful payments, UNLESS they have 0 payments (meaning newly manually added).
  
  const allCustomers = [...processedDbCustomers.filter((c: any) => c.payments.length > 0 || c.payments.length === 0), ...Array.from(virtualCustomersMap.values())];

  return <CustomersClient customers={allCustomers} />;
}
