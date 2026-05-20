import { getCurrentUserAndMerchant } from "@/utils/supabase/auth-helper";
import { CustomersClient } from "./customers-client";

export default async function CustomersPage() {
  const { merchant, supabase } = await getCurrentUserAndMerchant();

  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      payments (
        id,
        gross_amount,
        created_at
      )
    `)
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false });

  return <CustomersClient customers={customers || []} />;
}
