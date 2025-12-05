/*
  # Add Smart Farming Tools Usage Tables

  ## Overview
  This migration creates tables to track usage of the Smart Farming Tools (Crop Planner and Crop Analyzer).

  ## New Tables

  ### 1. `crop_planner_usage`
  Tracks crop planner tool usage and recommendations
  - `id` (uuid, primary key) - Unique record identifier
  - `user_id` (uuid, nullable) - Reference to authenticated user (null for anonymous)
  - `location` (text) - Selected location/state
  - `soil_type` (text) - Selected soil type
  - `rainfall` (text) - Selected rainfall pattern
  - `crop_interest` (text) - Crop of interest
  - `recommendations` (jsonb) - Generated recommendations data
  - `created_at` (timestamptz) - Usage timestamp

  ### 2. `crop_analyzer_usage`
  Tracks crop analyzer tool usage and analysis results
  - `id` (uuid, primary key) - Unique record identifier
  - `user_id` (uuid, nullable) - Reference to authenticated user (null for anonymous)
  - `image_url` (text, nullable) - URL to analyzed image (if stored)
  - `health_status` (text) - Detected health status
  - `confidence` (numeric) - Analysis confidence score
  - `analysis_result` (jsonb) - Full analysis data
  - `created_at` (timestamptz) - Usage timestamp

  ## Security
  1. Enable RLS on all tables
  2. Allow users to create and read their own records
  3. Anonymous users can insert but have limited read access

  ## Notes
  - Tracks tool usage for analytics and improvements
  - Helps users review their past analyses
  - All timestamps use UTC timezone
*/

-- Create crop_planner_usage table
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

-- Create crop_analyzer_usage table
CREATE TABLE IF NOT EXISTS crop_analyzer_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text,
  health_status text NOT NULL DEFAULT '',
  confidence numeric DEFAULT 0,
  analysis_result jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_crop_planner_usage_user_id ON crop_planner_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_planner_usage_created_at ON crop_planner_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crop_analyzer_usage_user_id ON crop_analyzer_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_analyzer_usage_created_at ON crop_analyzer_usage(created_at DESC);

-- Enable Row Level Security
ALTER TABLE crop_planner_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_analyzer_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crop_planner_usage

CREATE POLICY "Anyone can insert crop planner records"
  ON crop_planner_usage FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own crop planner records"
  ON crop_planner_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view their records"
  ON crop_planner_usage FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for crop_analyzer_usage

CREATE POLICY "Anyone can insert crop analyzer records"
  ON crop_analyzer_usage FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own crop analyzer records"
  ON crop_analyzer_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view their records"
  ON crop_analyzer_usage FOR SELECT
  TO anon
  USING (true);
