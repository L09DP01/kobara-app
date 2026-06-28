import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPayments() {
  const { data, error } = await supabase.from('payments').select('*');
  if (error) {
    console.error("Error fetching payments:", error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

checkPayments();
