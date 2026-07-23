// Bootstrap script — run once to create Supabase tables
// Usage: node supabase/bootstrap.mjs
// Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read .env manually
const env = readFileSync('.env', 'utf-8');
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function bootstrap() {
  console.log('🎁 Gift Yours — Supabase Bootstrap\n');

  // Test connection
  const { error: testError } = await supabase.from('settings').select('key').limit(1);

  if (!testError) {
    console.log('✅ Tables already exist! Database is ready.');
    process.exit(0);
  }

  console.log('Tables not found. Please run the schema manually:');
  console.log('');
  console.log('1. Go to: https://supabase.com/dashboard/project/unytmrseyxjngcowsgja/sql/new');
  console.log('2. Copy the contents of: supabase/schema.sql');
  console.log('3. Paste and click Run');
  console.log('');
  console.log('Error details:', testError.message);
}

bootstrap().catch(console.error);
