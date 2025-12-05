# How to Activate RAG Documents

Follow these simple steps to activate the RAG (Retrieval Augmented Generation) system:

## Step 1: Apply the Database Migration

You need to run the SQL migration to create the database schema.

### Option A: Using Supabase Dashboard
1. Go to your Supabase dashboard: https://0ec90b57d6e95fcbda19832f.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `rag-documents-migration.sql` and paste it
5. Click **Run** to execute the migration

### Option B: Using Supabase CLI (if installed)
```bash
supabase db push
```

## Step 2: Deploy the Edge Functions

The following edge functions need to be deployed:

1. **store-documents** - Stores document chunks with embeddings
2. **rag-query** - Searches for relevant documents
3. **agrilingua-chat** - Updated chat function with RAG support

### Deploy via Supabase Dashboard:
1. Go to **Edge Functions** in your Supabase dashboard
2. For each function folder in `supabase/functions/`:
   - Click **New Function** or update existing
   - Copy the code from the function's `index.ts`
   - Deploy the function

## Step 3: Populate the Documents

Once the migration is applied and functions are deployed, populate the documents:

### Method 1: Run the populate script
```bash
# Make sure you have Deno installed
deno run --allow-net --allow-env scripts/populate-documents.ts
```

### Method 2: Manual API call
```bash
# Using the store-documents function
curl -X POST \
  https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/store-documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  --data @- << 'EOF'
{
  "chunks": [
    {
      "document_name": "Test Document",
      "content": "Sample agricultural content",
      "metadata": {"page": 1}
    }
  ]
}
EOF
```

The populate script already contains all the processed document content from your uploaded PDFs.

## Step 4: Test the RAG System

Once everything is set up, test it by asking agricultural questions in the chatbot:

**Example questions:**
- "How do I test my soil drainage?"
- "What is the best spacing for tomatoes?"
- "When should I water my vegetables?"
- "How do I improve my soil health?"

The chatbot will now search the uploaded documents and provide accurate, context-based answers.

## Verification

To verify the RAG system is working:

1. **Check database:** Query the `document_chunks` table to ensure documents are stored
   ```sql
   SELECT COUNT(*) FROM document_chunks;
   ```

2. **Test search:** Use the `match_document_chunks` function
   ```sql
   -- This will be called automatically by the chatbot
   ```

3. **Check edge function logs:** View logs in Supabase dashboard to see if RAG queries are working

## Troubleshooting

**Problem:** Documents not showing in responses
- Verify the migration was applied successfully
- Check that documents were populated (count rows in `document_chunks`)
- Look at edge function logs for errors

**Problem:** Edge functions failing
- Ensure all environment variables are set in Supabase
- Check function logs for specific errors
- Verify the `vector` extension is enabled

**Problem:** Low quality responses
- Adjust `match_threshold` in `agrilingua-chat/index.ts` (currently 0.3)
- Lower threshold = more results, Higher threshold = stricter matching
- Increase `match_count` for more context

## What Happens Next

After activation:
1. User asks a question in any language (English, Hausa, Yoruba, Igbo)
2. System converts question to vector embedding
3. Searches `document_chunks` for similar content
4. Returns top 3 most relevant chunks
5. Generates response with context
6. If no relevant docs found, uses fallback responses

Your agricultural documents are now powering the chatbot with accurate, reliable information!
