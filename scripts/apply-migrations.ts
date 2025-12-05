import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  console.log('Applying migrations to:', supabaseUrl);

  const migrations = [
    'database-migration.sql',
    'rag-documents-migration.sql',
    'market-prices-migration.sql',
    'tool-usage-migration.sql'
  ];

  for (const migration of migrations) {
    console.log(`\nApplying ${migration}...`);
    const filePath = path.join(process.cwd(), migration);

    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${migration} - file not found`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`Error applying ${migration}:`, error);
    } else {
      console.log(`✓ ${migration} applied successfully`);
    }
  }
}

applyMigrations().catch(console.error);
