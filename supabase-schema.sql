-- Create the chat_history table for storing user conversations
CREATE TABLE chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL
);

-- Create an index on user_id for faster queries
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);

-- Create an index on created_at for chronological ordering
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to only see their own chat history
CREATE POLICY "Users can view own chat history" ON chat_history
  FOR SELECT USING (auth.uid()::text = user_id);

-- Create a policy that allows users to insert their own messages
CREATE POLICY "Users can insert own messages" ON chat_history
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Note: In production, you might want to use the service role key for server-side operations
-- and implement proper user authentication checks in your tRPC procedures
