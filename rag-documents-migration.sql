/*
  # Create RAG Document Storage Schema

  ## Overview
  This migration sets up the infrastructure for Retrieval Augmented Generation (RAG)
  to store and query agricultural documents.

  ## New Tables

  ### 1. `document_chunks`
  Stores processed document chunks with vector embeddings
  - `id` (uuid, primary key) - Unique chunk identifier
  - `document_name` (text) - Name of the source document
  - `content` (text) - The actual text content
  - `metadata` (jsonb) - Additional metadata (page number, section, etc.)
  - `embedding` (vector(384)) - Vector embedding for semantic search
  - `created_at` (timestamp)

  ## Extensions
  - Enable `vector` extension for pgvector support

  ## Security
  - Enable RLS on `document_chunks` table
  - Public read access for agricultural information
  - Service role only for write operations

  ## Indexes
  - HNSW index on embedding column for fast similarity search
  - Index on document_name for filtering
*/

-- Enable vector extension for pgvector support
CREATE EXTENSION IF NOT EXISTS vector;

-- Create document_chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  embedding vector(384),
  created_at timestamptz DEFAULT now()
);

-- Create index on document_name for filtering
CREATE INDEX IF NOT EXISTS idx_document_chunks_name ON document_chunks(document_name);

-- Create HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks
USING hnsw (embedding vector_cosine_ops);

-- Enable Row Level Security
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read document chunks (public agricultural information)
CREATE POLICY "Anyone can read document chunks"
  ON document_chunks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only service role can insert document chunks
CREATE POLICY "Service role can insert document chunks"
  ON document_chunks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Only service role can update document chunks
CREATE POLICY "Service role can update document chunks"
  ON document_chunks
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Only service role can delete document chunks
CREATE POLICY "Service role can delete document chunks"
  ON document_chunks
  FOR DELETE
  TO service_role
  USING (true);

-- Function: Search for similar document chunks using vector similarity
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  document_name text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_chunks.id,
    document_chunks.document_name,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;
