const fs = require('fs');
const pdf = require('pdf-parse');

console.log('pdf type:', typeof pdf);

// Try to parse a PDF
const dataBuffer = fs.readFileSync('./rag-documents/932.pdf');

pdf(dataBuffer)
  .then(function(data) {
    console.log('Success! Pages:', data.numpages);
    console.log('Text length:', data.text.length);
    console.log('First 200 chars:', data.text.substring(0, 200));
  })
  .catch(err => {
    console.error('Error:', err);
  });
