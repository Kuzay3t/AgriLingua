# Manual Edge Function Deployment

Since the automated deployment isn't working due to expired credentials, you can manually deploy the improved chatbot:

## Using Supabase CLI

1. Install Supabase CLI if you haven't:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref 0ec90b57d6e95fcbda19832f
```

4. Deploy the edge function:
```bash
supabase functions deploy agrilingua-chat
```

5. Set the OpenAI API key:
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-aR5zpJTsXSM6ZcT2gUIdeeKN3XCLhoVzvbWf08g4xOaCVimNW3NGicKVTst1UCXFmi8UVwLNe0T3BlbKFJu7c4gjJImwq0FZb3y7u5NgzJCDUVy8eedo_fPg56E4HPcnO2o98fser3WQoCUkkpcxjKKP9QwA
```

## What This Will Fix

After deployment, asking "What is the best crop to plant in Kaduna?" will return:

```
For crop selection, here are recommendations by Nigerian region:

**Northern Nigeria (Kaduna, Kano, Sokoto):**
Best crops: Sorghum, millet, maize, groundnuts, cotton, tomatoes, onions, pepper
- Plant at start of rainy season (May-June)
- Requires good drainage and moderate irrigation
- Consider soil testing before planting

**Middle Belt (Benue, Plateau, Nasarawa):**
Best crops: Yams, cassava, rice, sesame, soybeans, sweet potatoes
- Longer growing season
- Mix of grain and tuber crops
- Good for crop rotation systems

**Southern Nigeria (Lagos, Ogun, Rivers):**
Best crops: Cassava, plantain, oil palm, cocoa, vegetables, maize
- Year-round planting possible
- High rainfall, focus on drainage
- Ideal for tree crops

**General Tips:**
1. Start with soil testing (N-P-K levels, pH)
2. Choose drought-resistant varieties for northern regions
3. Practice crop rotation to maintain soil health
4. Use organic matter to improve soil structure
5. Plan planting around rainy season timing
```

With OpenAI configured, responses will be even more detailed and conversational.
