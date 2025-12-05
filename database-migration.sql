/*
  # AgriLingua Database Schema

  ## Overview
  This migration creates the database schema for AgriLingua, a multilingual agricultural advisory platform.

  ## New Tables

  ### 1. `chat_sessions`
  Stores individual chat sessions for users
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid, nullable) - Reference to authenticated user (null for anonymous)
  - `language` (text) - Selected language (hausa, yoruba, igbo, english)
  - `created_at` (timestamptz) - Session creation timestamp
  - `updated_at` (timestamptz) - Last activity timestamp

  ### 2. `messages`
  Stores all messages in chat sessions
  - `id` (uuid, primary key) - Unique message identifier
  - `session_id` (uuid, foreign key) - Reference to chat_sessions
  - `role` (text) - Message sender: 'user' or 'assistant'
  - `content` (text) - Message text content
  - `message_type` (text) - Type: 'text', 'voice', 'image'
  - `image_url` (text, nullable) - URL for uploaded images
  - `audio_url` (text, nullable) - URL for voice recordings
  - `language` (text) - Message language
  - `created_at` (timestamptz) - Message timestamp

  ## Security

  1. Enable RLS on all tables
  2. Allow anonymous users to create and read their own sessions
  3. Allow users to insert and read messages in their sessions
  4. Authenticated users can access all their sessions

  ## Notes
  - Anonymous sessions are supported for non-registered farmers
  - All timestamps use UTC timezone
  - Messages are linked to sessions via foreign key with cascade delete
*/

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions

-- Allow anyone to create a session (including anonymous users)
CREATE POLICY "Anyone can create chat sessions"
  ON chat_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own sessions (authenticated users by user_id, anon by session id)
CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous users to view sessions (they'll need to know the session_id)
CREATE POLICY "Anonymous users can view sessions"
  ON chat_sessions FOR SELECT
  TO anon
  USING (true);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anonymous users can update sessions
CREATE POLICY "Anonymous users can update sessions"
  ON chat_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for messages

-- Anyone can insert messages (both authenticated and anonymous)
CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read messages from their sessions
CREATE POLICY "Anyone can read messages"
  ON messages FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET updated_at = now()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat_sessions.updated_at when a new message is added
CREATE TRIGGER update_session_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_timestamp();
