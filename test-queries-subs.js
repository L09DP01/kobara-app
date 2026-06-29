import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data: merchant } = await supabaseAdmin.from('merchants').select('id, current_environment').limit(1).single();
  const environment = merchant.current_environment || 'test';

  let query = supabaseAdmin
      .from('subscriptions')
      .select('id, amount:amount_htg, status, billing_interval:billing_cycle, next_billing_date:current_period_end, created_at, plans(name)', { count: 'exact' })
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })
      
  const { data: subs, error } = await query;
  console.log("Subscriptions error:", error?.message);
  console.log("Subscriptions count:", subs?.length);
  console.log("Data:", JSON.stringify(subs, null, 2));
}

test();
