# RAG (Retrieval Augmented Generation) Setup

This document explains how the RAG system is set up for AgriLingua to provide accurate, document-based responses to farming questions.

## Overview

The RAG system allows the chatbot to retrieve relevant information from uploaded agricultural documents and use that information to answer user questions. The system uses:

- **Vector embeddings** - Document text is converted to numerical vectors using Supabase's `gte-small` model
- **Semantic search** - User queries are matched against document chunks using cosine similarity
- **Supabase pgvector** - Vector database for efficient similarity search

## Documents Included

The following agricultural documents have been processed and stored:

1. **Soil Type Handout** - Information about soil types, drainage, percolation tests, and soil biology
2. **Irrigation Water Management Guide** - Comprehensive guide on irrigation practices for small farms
3. **Vegetable Garden Planting Guide** - Planting schedules, yields, and crop information

## Database Schema

### Table: `document_chunks`

```sql
CREATE TABLE document_chunks (
  id uuid PRIMARY KEY,
  document_name text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  embedding vector(384),
  created_at timestamptz DEFAULT now()
);
```

### Function: `match_document_chunks`

RPC function that performs vector similarity search:

```sql
match_document_chunks(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
```

## Edge Functions

### 1. `store-documents`

Stores document chunks with embeddings in the database.

**Endpoint:** `POST /functions/v1/store-documents`

**Request:**
```json
{
  "chunks": [
    {
      "document_name": "Document Name",
      "content": "Document content...",
      "metadata": {"section": "Section Name", "page": 1}
    }
  ]
}
```

### 2. `rag-query`

Searches for relevant document chunks based on a query.

**Endpoint:** `POST /functions/v1/rag-query`

**Request:**
```json
{
  "query": "How do I test my soil drainage?",
  "topK": 5
}
```

**Response:**
```json
{
  "query": "How do I test my soil drainage?",
  "results": [
    {
      "id": "uuid",
      "document_name": "Soil Type Handout",
      "content": "WSU Percolation Test...",
      "metadata": {"section": "Percolation Test", "page": 1},
      "similarity": 0.85
    }
  ]
}
```

### 3. `agrilingua-chat`

Main chat endpoint that integrates RAG for contextual responses. Automatically searches relevant documents and includes context in responses.

## How to Populate Documents

### Option 1: Using the populate script

1. Ensure your `.env` file has the Supabase credentials
2. Run the migration to create the database schema:
   ```bash
   # Apply the RAG migration (this will be done automatically by Supabase)
   ```

3. Run the populate script:
   ```bash
   deno run --allow-net --allow-env scripts/populate-documents.ts
   ```

### Option 2: Manual API call

Make a POST request to the `store-documents` edge function with your document chunks.

## How RAG Works in the Chatbot

1. **User sends a question** to the `agrilingua-chat` endpoint
2. **Query is embedded** using the `gte-small` model
3. **Similar documents are found** using the `match_document_chunks` function
4. **Relevant context is extracted** from the top matching chunks
5. **Response is generated** using the context and returned to the user

## Customization

### Adding New Documents

To add new documents:

1. Extract text content from your document
2. Break it into logical chunks (paragraphs or sections)
3. Add metadata (document name, section, page)
4. Send to `store-documents` endpoint

Example:
```typescript
const newChunks = [
  {
    document_name: "Pest Management Guide",
    content: "Integrated Pest Management (IPM) is...",
    metadata: { section: "Introduction", page: 1 }
  }
];

// Send to store-documents endpoint
fetch(`${SUPABASE_URL}/functions/v1/store-documents`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_KEY}`
  },
  body: JSON.stringify({ chunks: newChunks })
});
```

### Adjusting Similarity Threshold

In `agrilingua-chat/index.ts`, adjust the `match_threshold` parameter:

```typescript
const { data: chunks } = await supabase.rpc("match_document_chunks", {
  query_embedding: embedding,
  match_threshold: 0.3,  // Lower = more results, Higher = more strict
  match_count: 3,        // Number of chunks to return
});
```

## Benefits

- **Accurate information** - Responses based on actual agricultural documents
- **Scalable** - Easy to add more documents
- **Fast** - Vector search is optimized with HNSW indexes
- **Multilingual ready** - Context can be translated to local languages
- **Cost-effective** - Uses Supabase's built-in AI features

## Next Steps

1. Apply the database migration (`rag-documents-migration.sql`)
2. Deploy the edge functions
3. Run the populate script to load initial documents
4. Test the chatbot with farming questions
5. Monitor and adjust similarity thresholds as needed
