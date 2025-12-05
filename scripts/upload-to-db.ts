import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

interface DocumentChunk {
  document_name: string;
  content: string;
  metadata: {
    chunk_index: number;
    total_chunks?: number;
    pages?: number;
  };
}

async function uploadChunks() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const chunksFile = './processed-chunks.json';

  if (!fs.existsSync(chunksFile)) {
    console.error('No processed-chunks.json file found. Run process-pdfs.ts first.');
    return;
  }

  const chunks: DocumentChunk[] = JSON.parse(fs.readFileSync(chunksFile, 'utf-8'));

  console.log(`\nUploading ${chunks.length} chunks to database...`);

  const batchSize = 50;
  let uploadedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/store-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ chunks: batch }),
      });

      if (response.ok) {
        const result = await response.json();
        uploadedCount += batch.length;
        console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1}: ${uploadedCount}/${chunks.length} chunks`);
      } else {
        const error = await response.text();
        console.error(`  ✗ Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
        failedCount += batch.length;
      }
    } catch (error) {
      console.error(`  ✗ Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
      failedCount += batch.length;
    }
  }

  console.log(`\n✅ Upload complete!`);
  console.log(`   Successful: ${uploadedCount}`);
  console.log(`   Failed: ${failedCount}`);
}

uploadChunks().catch(console.error);
