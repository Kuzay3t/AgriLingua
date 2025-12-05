import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filename: string) {
  console.log(`\n📄 Applying ${filename}...`);
  const filePath = path.join(process.cwd(), filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filename} - file not found`);
    return false;
  }

  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      console.error(`❌ Error: ${response.statusText}`);
      return false;
    }

    console.log(`✅ ${filename} applied successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying ${filename}:`, error);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 Setting up AgriLingua database...');
  console.log('📍 Target:', supabaseUrl);

  const migrations = [
    'database-migration.sql',
    'rag-documents-migration.sql',
    'market-prices-migration.sql',
    'tool-usage-migration.sql'
  ];

  let successCount = 0;

  for (const migration of migrations) {
    const success = await executeSQLFile(migration);
    if (success) successCount++;
  }

  console.log(`\n🎉 Database setup complete! ${successCount}/${migrations.length} migrations applied.`);
}

setupDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
