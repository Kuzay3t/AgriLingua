import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Checking database setup...\n');

  try {
    const { count, error } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error accessing document_chunks table:', error.message);
      console.log('\n⚠️  The database migration needs to be applied.');
      console.log('Run the migration in rag-documents-migration.sql');
      return;
    }

    console.log(`✅ document_chunks table exists`);
    console.log(`📊 Number of chunks: ${count || 0}\n`);

    if (count === 0) {
      console.log('⚠️  No documents loaded yet.');
      console.log('Run: npx tsx scripts/process-pdfs.ts');
    } else {
      console.log('✅ Documents are loaded!');

      const { data: sample } = await supabase
        .from('document_chunks')
        .select('document_name')
        .limit(5);

      if (sample) {
        console.log('\nSample documents:');
        const uniqueDocs = [...new Set(sample.map(s => s.document_name))];
        uniqueDocs.forEach(doc => console.log(`  - ${doc}`));
      }
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
