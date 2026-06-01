import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: payments, error } = await supabase.from('payments').select('*').limit(5);
  console.log('Error:', error);
  if (payments && payments.length > 0) {
    console.log('First Payment ID:', payments[0].id);
    console.log('First Payment Reference:', payments[0].kobara_reference);
    
    // Now try querying that specific payment ID
    const { data: singlePayment, error: singleError } = await supabase.from('payments').select('*').eq('id', payments[0].id).single();
    console.log('Single Error:', singleError);
    console.log('Single Payment found:', !!singlePayment);
  } else {
    console.log('No payments found.');
  }
}
run();
