import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const merchantId = 'c0a1a0f0-3d5b-4d4d-a5f1-3d2c8c4f0b2f'; // Will find an actual one first

  const { data: merchant } = await supabaseAdmin.from('merchants').select('id, current_environment').limit(1).single();
  
  if (!merchant) {
    console.log("No merchant found");
    return;
  }
  
  const environment = merchant.current_environment || 'test';
  console.log("Merchant:", merchant.id, "Environment:", environment);

  // 1. Dashboard query
  const { data: dashboard, error: err1 } = await supabaseAdmin
      .from('payments')
      .select('id, amount, net_amount, currency, status, provider, created_at, kobara_reference, customers(name)')
      .eq('merchant_id', merchant.id)
      .eq('environment', environment)
      .order('created_at', { ascending: false })
      .limit(10);
  console.log("Dashboard fetch error:", err1?.message);
  console.log("Dashboard count:", dashboard?.length);

  // 2. Payments query
  let query = supabaseAdmin
      .from('payments')
      .select('id, amount, net_amount, currency, status, provider, payment_method, created_at, kobara_reference, bazik_transaction_id, customers(name, email)', { count: 'exact' })
      .eq('merchant_id', merchant.id)
      .eq('environment', environment)
      .order('created_at', { ascending: false })
      .range(0, 49);
      
  const { data: payments, error: err2 } = await query;
  console.log("Payments fetch error:", err2?.message);
  console.log("Payments count:", payments?.length);
}

test();
