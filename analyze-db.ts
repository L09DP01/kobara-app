import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeDB() {
  console.log("--- ANALYZING DATABASE ---");
  
  // 1. Check Merchants
  const { data: merchants, error: mErr } = await supabase.from('merchants').select('id, business_name, current_environment, available_balance');
  if (mErr) console.error("Error fetching merchants:", mErr);
  else {
    console.log(`Found ${merchants.length} merchants.`);
    merchants.forEach(m => {
      console.log(`Merchant: ${m.business_name} (ID: ${m.id})`);
      console.log(`  Environment: ${m.current_environment}`);
      console.log(`  Balance: ${m.available_balance}`);
    });
  }

  // 2. Check Payments
  const { data: payments, error: pErr } = await supabase.from('payments').select('id, amount, status, environment, merchant_id, created_at, customers(name)');
  if (pErr) console.error("Error fetching payments:", pErr);
  else {
    console.log(`\nFound ${payments.length} payments.`);
    
    // Group by merchant and environment
    const stats: Record<string, any> = {};
    payments.forEach(p => {
      const key = `${p.merchant_id} | Env: ${p.environment}`;
      if (!stats[key]) {
        stats[key] = { total: 0, succeeded: 0, failed: 0, pending: 0, customers: new Set() };
      }
      stats[key].total++;
      if (p.status === 'succeeded') stats[key].succeeded++;
      if (p.status === 'failed') stats[key].failed++;
      if (p.status === 'pending') stats[key].pending++;
      if ((p.customers as any)?.name) stats[key].customers.add((p.customers as any).name);
    });
    
    for (const [key, stat] of Object.entries(stats)) {
      console.log(`\nStats for ${key}:`);
      console.log(`  Total Payments: ${stat.total}`);
      console.log(`  Succeeded: ${stat.succeeded}`);
      console.log(`  Failed: ${stat.failed}`);
      console.log(`  Pending: ${stat.pending}`);
      console.log(`  Unique Customers: ${Array.from(stat.customers).join(', ')}`);
    }
  }
}

analyzeDB();
