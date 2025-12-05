import dotenv from 'dotenv';
dotenv.config();

const jwt = process.env.VITE_SUPABASE_ANON_KEY;

if (jwt) {
  const parts = jwt.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  console.log('JWT Payload:', JSON.stringify(payload, null, 2));
  console.log('\nExpiry:', new Date(payload.exp * 1000).toISOString());
  console.log('Now:', new Date().toISOString());
  console.log('Expired:', payload.exp * 1000 < Date.now());
} else {
  console.log('No JWT found');
}
