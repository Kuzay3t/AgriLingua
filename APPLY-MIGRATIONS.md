# Apply Database Migrations

## Instructions

Go to your Supabase dashboard SQL Editor:
https://supabase.com/dashboard/project/lyyjosysykfcjyflvceg/sql

Copy and paste each section below into the SQL Editor and click "RUN" after each one.

---

## Migration 1: Chat Sessions and Messages

```sql
-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'english',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image')),
  image_url text,
  audio_url text,
  language text NOT NULL DEFAULT 'english',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "Anyone can create chat sessions"
  ON chat_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view sessions"
  ON chat_sessions FOR SELECT TO anon USING (true);

CREATE POLICY "Users can update own sessions"
  ON chat_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update sessions"
  ON chat_sessions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Messages policies
CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON messages FOR SELECT TO anon, authenticated USING (true);

-- Trigger function
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions SET updated_at = now() WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_session_timestamp();
```

---

## Migration 2: RAG Documents Storage

```sql
-- Enable vector extension
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_name ON document_chunks(document_name);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks
  USING hnsw (embedding vector_cosine_ops);

-- Enable RLS
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read document chunks"
  ON document_chunks FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Service role can insert document chunks"
  ON document_chunks FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Service role can update document chunks"
  ON document_chunks FOR UPDATE TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete document chunks"
  ON document_chunks FOR DELETE TO service_role USING (true);

-- Search function
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
LANGUAGE sql STABLE AS $$
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
```

---

## Migration 3: Market Prices

```sql
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  crop_category text NOT NULL DEFAULT 'Grains',
  market_name text NOT NULL,
  region text NOT NULL,
  price_per_kg decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  trend text NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  trend_percentage decimal(5,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  best_selling_period text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view market prices"
  ON market_prices FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can insert market prices"
  ON market_prices FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update market prices"
  ON market_prices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete market prices"
  ON market_prices FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_market_prices_crop_name ON market_prices(crop_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_market_name ON market_prices(market_name);
CREATE INDEX IF NOT EXISTS idx_market_prices_last_updated ON market_prices(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_market_prices_category ON market_prices(crop_category);

-- Sample data
INSERT INTO market_prices (crop_name, crop_category, market_name, region, price_per_kg, trend, trend_percentage, best_selling_period, notes) VALUES
  ('Maize (Yellow)', 'Grains', 'Dawanau Market', 'Northern Nigeria (Kano)', 450.00, 'up', 8.5, 'Good time to sell', 'High demand due to festive season'),
  ('Maize (White)', 'Grains', 'Mile 12 Market', 'Western Nigeria (Lagos)', 520.00, 'up', 12.0, 'Excellent time to sell', 'Supply shortage driving prices up'),
  ('Rice (Local)', 'Grains', 'Wuse Market', 'Central Nigeria (Abuja)', 680.00, 'stable', 0, 'Fair price', 'Steady market conditions'),
  ('Rice (Foreign)', 'Grains', 'Onitsha Market', 'Eastern Nigeria', 850.00, 'down', -5.0, 'Wait 2-3 weeks', 'Recent imports affecting prices'),
  ('Beans (Brown)', 'Grains', 'Dawanau Market', 'Northern Nigeria (Kano)', 720.00, 'up', 15.0, 'Excellent time to sell', 'Peak demand period'),
  ('Beans (White)', 'Grains', 'Mile 12 Market', 'Western Nigeria (Lagos)', 780.00, 'stable', 2.0, 'Good time to sell', 'Consistent pricing'),
  ('Tomatoes', 'Vegetables', 'Mile 12 Market', 'Western Nigeria (Lagos)', 350.00, 'down', -20.0, 'Wait if possible', 'Harvest season oversupply'),
  ('Tomatoes', 'Vegetables', 'Bodija Market', 'Western Nigeria (Ibadan)', 320.00, 'down', -18.0, 'Wait if possible', 'Peak harvest period'),
  ('Onions', 'Vegetables', 'Dawanau Market', 'Northern Nigeria (Kano)', 280.00, 'up', 10.0, 'Good time to sell', 'Storage shortage'),
  ('Pepper (Red)', 'Vegetables', 'Mile 12 Market', 'Western Nigeria (Lagos)', 450.00, 'stable', 0, 'Fair price', 'Normal market activity'),
  ('Yam', 'Tubers', 'Bodija Market', 'Western Nigeria (Ibadan)', 420.00, 'up', 7.0, 'Good time to sell', 'Festival period approaching'),
  ('Cassava', 'Tubers', 'Onitsha Market', 'Eastern Nigeria', 180.00, 'stable', -1.0, 'Fair price', 'Steady demand'),
  ('Groundnut', 'Legumes', 'Dawanau Market', 'Northern Nigeria (Kano)', 650.00, 'up', 12.0, 'Excellent time to sell', 'Export demand high'),
  ('Soybean', 'Legumes', 'Wuse Market', 'Central Nigeria (Abuja)', 580.00, 'stable', 3.0, 'Good time to sell', 'Processing factories active'),
  ('Sorghum', 'Livestock Feed', 'Dawanau Market', 'Northern Nigeria (Kano)', 380.00, 'up', 6.0, 'Good time to sell', 'Animal feed demand rising'),
  ('Millet', 'Livestock Feed', 'Sokoto Market', 'Northern Nigeria', 420.00, 'stable', 1.0, 'Fair price', 'Consistent demand'),
  ('Palm Oil', 'Oil Seeds', 'Onitsha Market', 'Eastern Nigeria', 1200.00, 'up', 20.0, 'Excellent time to sell', 'Very high demand'),
  ('Groundnut Oil', 'Oil Seeds', 'Dawanau Market', 'Northern Nigeria (Kano)', 980.00, 'up', 15.0, 'Excellent time to sell', 'Supply constraints'),
  ('Cocoa', 'Cash Crops', 'Ondo Market', 'Western Nigeria', 2800.00, 'stable', 0, 'Fair price', 'International prices stable'),
  ('Coffee', 'Cash Crops', 'Mambilla Market', 'Central Nigeria', 3200.00, 'up', 8.0, 'Good time to sell', 'Export opportunities available')
ON CONFLICT DO NOTHING;
```

---

## Migration 4: Tool Usage Tracking

```sql
CREATE TABLE IF NOT EXISTS crop_planner_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  location text NOT NULL,
  soil_type text NOT NULL,
  rainfall text NOT NULL,
  crop_interest text NOT NULL,
  recommendations jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crop_analyzer_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text,
  health_status text NOT NULL DEFAULT '',
  confidence numeric DEFAULT 0,
  analysis_result jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crop_planner_usage_user_id ON crop_planner_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_planner_usage_created_at ON crop_planner_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crop_analyzer_usage_user_id ON crop_analyzer_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_analyzer_usage_created_at ON crop_analyzer_usage(created_at DESC);

ALTER TABLE crop_planner_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_analyzer_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert crop planner records"
  ON crop_planner_usage FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users can view own crop planner records"
  ON crop_planner_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view their records"
  ON crop_planner_usage FOR SELECT TO anon USING (true);

CREATE POLICY "Anyone can insert crop analyzer records"
  ON crop_analyzer_usage FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Users can view own crop analyzer records"
  ON crop_analyzer_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view their analyzer records"
  ON crop_analyzer_usage FOR SELECT TO anon USING (true);
```

---

## Done!

After running all 4 migrations, your database is ready. Return to this chat and let me know when you've completed this step.
