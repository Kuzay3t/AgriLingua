import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import 'dotenv/config';

interface DocumentChunk {
  document_name: string;
  content: string;
  metadata: {
    page?: number;
    chunk_index: number;
    total_chunks?: number;
  };
}

function chunkText(text: string, maxChunkSize: number = 1500): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedParagraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 50);
}

async function processPDF(filePath: string): Promise<DocumentChunk[]> {
  const fileName = path.basename(filePath, '.pdf');
  console.log(`Processing: ${fileName}`);

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });

    const result = await parser.getText();
    await parser.destroy();

    const textChunks = chunkText(result.text);

    return textChunks.map((content, index) => ({
      document_name: fileName,
      content,
      metadata: {
        chunk_index: index,
        total_chunks: textChunks.length,
        pages: result.numPages,
      },
    }));
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return [];
  }
}

async function processAllPDFs() {
  const ragDocsDir = path.join(process.cwd(), 'rag-documents');

  if (!fs.existsSync(ragDocsDir)) {
    console.error('rag-documents directory not found');
    process.exit(1);
  }

  const files = fs.readdirSync(ragDocsDir).filter(file => file.endsWith('.pdf'));

  console.log(`Found ${files.length} PDF files to process\n`);

  let allChunks: DocumentChunk[] = [];

  for (const file of files) {
    const filePath = path.join(ragDocsDir, file);
    const chunks = await processPDF(filePath);
    allChunks = allChunks.concat(chunks);
    console.log(`  ✓ Extracted ${chunks.length} chunks\n`);
  }

  console.log(`\nTotal chunks extracted: ${allChunks.length}`);

  return allChunks;
}

async function uploadChunks(chunks: DocumentChunk[]) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  }

  console.log('\nUploading chunks to database...');

  const batchSize = 50;
  let uploadedCount = 0;

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

      const result = await response.json();

      if (response.ok) {
        uploadedCount += batch.length;
        console.log(`  ✓ Uploaded batch ${Math.floor(i / batchSize) + 1}: ${uploadedCount}/${chunks.length} chunks`);
      } else {
        console.error(`  ✗ Error uploading batch:`, result);
      }
    } catch (error) {
      console.error(`  ✗ Error uploading batch:`, error);
    }
  }

  console.log(`\n✓ Successfully uploaded ${uploadedCount} chunks to database`);
}

async function main() {
  console.log('🚀 Starting PDF processing...\n');

  const chunks = await processAllPDFs();

  if (chunks.length === 0) {
    console.log('No chunks to process');
    return;
  }

  fs.writeFileSync('./processed-chunks.json', JSON.stringify(chunks, null, 2));
  console.log(`\n✅ Saved ${chunks.length} chunks to processed-chunks.json`);
  console.log('\nTo upload to database, run:');
  console.log('  npx tsx scripts/upload-to-db.ts');
}

main().catch(console.error);
