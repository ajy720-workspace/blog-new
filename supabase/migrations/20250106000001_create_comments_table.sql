-- Create comments table for blog post comments
-- This table stores all comments for blog posts, supporting anonymous users

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notion_page_id VARCHAR NOT NULL,  -- FK reference to Notion post (semantic only)
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),        -- Optional for future features
  content TEXT NOT NULL,
  user_id UUID,                     -- NULL for anonymous users, FK for authenticated
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false,
  ip_address INET,                  -- For moderation purposes
  user_agent TEXT                   -- For security tracking
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_notion_page_id ON comments(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add basic constraints
ALTER TABLE comments 
ADD CONSTRAINT check_author_name_length 
CHECK (char_length(author_name) >= 1 AND char_length(author_name) <= 100);

ALTER TABLE comments 
ADD CONSTRAINT check_content_length 
CHECK (char_length(content) >= 1 AND char_length(content) <= 2000);

-- Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
-- Allow anonymous users to read non-deleted comments
CREATE POLICY "Anyone can read non-deleted comments" ON comments
    FOR SELECT USING (is_deleted = false);

-- Allow anonymous users to insert comments
CREATE POLICY "Anonymous users can insert comments" ON comments
    FOR INSERT WITH CHECK (true);

-- Only allow users to soft-delete their own comments (for future use)
CREATE POLICY "Users can soft-delete their own comments" ON comments
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (is_deleted = true);