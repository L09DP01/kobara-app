const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('id, amount, net_amount, gross_amount, fee_amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
    
  console.log("Error:", error);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let totalToday = 0;
  let totalWeek = 0;
  let refundCount = 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  if (payments) {
    payments.forEach(p => {
      const pDate = new Date(p.created_at);
      console.log(`Payment ${p.id} status: ${p.status}, amount: ${p.amount}, net_amount: ${p.net_amount}, date: ${pDate}, >=today: ${pDate >= today}`);
      if (p.status === 'succeeded' || p.status === 'completed') {
        if (pDate >= today) {
          totalToday += Number(p.net_amount || p.amount);
        }
        if (pDate >= oneWeekAgo) {
          totalWeek += Number(p.net_amount || p.amount);
        }
      }
      if (p.status === 'refunded') {
        refundCount++;
      }
    });
  }
  
  console.log("Total Today:", totalToday);
  console.log("Total Week:", totalWeek);
}
test();
