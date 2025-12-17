// src/utils/hfApi.ts
export const callHFAPI = async (url: string, payload: any) => {
  const HF_API_KEY = import.meta.env.VITE_HF_API_KEY || '';
  if (!HF_API_KEY) throw new Error('HF key missing');

  let attempts = 0;
  while (attempts < 3) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 503) {
        await new Promise(r => setTimeout(r, 2000 * (attempts + 1)));
        attempts++;
        continue;
      }
      if (!res.ok) throw new Error(`HF error ${res.status}`);
      return await res.json();
    } catch {
      attempts++;
    }
  }
  throw new Error('Translation failed after retries');
};