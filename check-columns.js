const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'smartcoreexpress@gmail.com')
    .single();

  if (userError) {
    console.error("Error fetching user:", userError);
    return;
  }

  console.log("smartcoreexpress@gmail.com user record:", user);

  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (merchantError) {
    console.error("Error fetching merchant:", merchantError);
  } else {
    console.log("Merchant record:", merchant);
  }
}

main();
