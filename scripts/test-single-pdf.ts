import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function test() {
  const dataBuffer = fs.readFileSync('./rag-documents/932.pdf');
  console.log('Buffer size:', dataBuffer.length);
  console.log('First bytes:', dataBuffer.slice(0, 10).toString());

  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  await parser.destroy();

  console.log('Pages:', result.numPages);
  console.log('Text length:', result.text.length);
  console.log('First 200 chars:', result.text.substring(0, 200));
}

test().catch(console.error);
