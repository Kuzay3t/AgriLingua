# RAG System Deployment Guide

Since you've already applied all 4 migrations, follow these steps to complete the RAG setup:

## Status Check

✅ Database migrations applied (4 migrations)
✅ PDF documents processed (processed-chunks.json exists, 2.6MB)
⏳ Edge functions need deployment
⏳ Document chunks need upload

## Step 1: Deploy Edge Functions

You need to deploy 3 edge functions manually using Supabase CLI:

### Install and Login to Supabase CLI

```bash
npm install -g supabase
supabase login
```

### Link Your Project

```bash
supabase link --project-ref 0ec90b57d6e95fcbda19832f
```

### Deploy the Functions

```bash
supabase functions deploy store-documents
supabase functions deploy rag-query
supabase functions deploy agrilingua-chat
supabase functions deploy crop-analyzer
supabase functions deploy pest-identifier
supabase functions deploy crop-planner
```

## Step 2: Upload Document Chunks

Once the `store-documents` function is deployed, upload your processed PDF chunks:

```bash
npx tsx scripts/upload-to-db.ts
```

This will upload all 2.6MB of processed agricultural documents to your database in batches of 50 chunks at a time.

## Step 3: Verify the Upload

Check that documents were uploaded successfully:

1. Go to your Supabase dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co
2. Navigate to **Table Editor**
3. Select the `document_chunks` table
4. You should see hundreds of rows with document content and embeddings

## Step 4: Test the RAG System

Test that everything works by asking agricultural questions in your chatbot:

### Good Test Questions:
- "How do I test my soil drainage?"
- "What is the best fertilizer for maize?"
- "When should I plant tomatoes in Nigeria?"
- "How do I manage pests organically?"
- "What crops grow well in sandy soil?"

The chatbot will now search your uploaded documents and provide accurate, context-based answers!

## What Each Edge Function Does

### store-documents
- Receives document chunks from the upload script
- Generates vector embeddings using Supabase AI (gte-small model)
- Stores chunks with embeddings in the `document_chunks` table
- Returns success/failure status

### rag-query
- Receives a text query
- Generates embedding for the query
- Searches for similar document chunks using pgvector
- Returns top matching chunks with similarity scores

### agrilingua-chat
- Main chatbot endpoint with RAG integration
- Takes user questions in any language (English, Hausa, Yoruba, Igbo)
- Searches relevant documents using rag-query
- Generates contextual responses using OpenAI (or fallback responses)
- Stores conversation history in database

### crop-analyzer
- Analyzes crop images for health status
- Identifies diseases and nutrient deficiencies
- Provides treatment recommendations
- Works in demo mode without OpenAI API key

### pest-identifier
- Identifies pests and diseases from images
- Provides organic and chemical treatment options
- Includes prevention strategies
- Always works (demo mode with realistic African pest data)

### crop-planner
- Helps plan crop planting schedules
- Provides region-specific recommendations for Nigeria
- Considers soil types and climate

## Troubleshooting

### Edge Function Deployment Fails
```bash
# Check your Supabase CLI login status
supabase projects list

# Re-link the project if needed
supabase link --project-ref 0ec90b57d6e95fcbda19832f
```

### Upload Script Fails
- Verify the store-documents function is deployed
- Check that `.env` has correct credentials
- Ensure processed-chunks.json exists

### No Results from RAG
- Verify document_chunks table has data
- Check edge function logs in Supabase dashboard
- Try lowering match_threshold in agrilingua-chat (currently 0.3)

## Next Steps After Deployment

1. **Test image upload** - Both crop analyzer and pest identifier
2. **Try multilingual queries** - Ask in Hausa, Yoruba, or Igbo
3. **Monitor function logs** - Check for errors in Supabase dashboard
4. **Adjust similarity threshold** - If responses aren't relevant enough

## Additional Configuration (Optional)

### Set OpenAI API Key for Better Responses

If you want AI-powered responses instead of fallbacks:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

Note: The system works without OpenAI - it uses intelligent fallback responses for all tools.

## Document Coverage

Your RAG system now includes knowledge from 29 agricultural PDFs covering:
- Crop planning and planting guides
- Soil health and management
- Irrigation and water management
- Fertilizer planning and application
- Pest and disease management
- Market intelligence
- Regional farming best practices

Total processed chunks: Check processed-chunks.json for exact count (approximately 1000+ chunks)
