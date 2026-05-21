require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const sql = fs.readFileSync('supabase/migrations/20260522000001_security_features.sql', 'utf8');
  
  // split by statements roughly
  const statements = sql.split(';');
  for(let stmt of statements) {
    if(stmt.trim().length === 0) continue;
    
    // Supabase JS doesn't have a direct raw SQL method easily unless we use RPC
    // Wait, let's just use postgres connection string
  }
}
run();
