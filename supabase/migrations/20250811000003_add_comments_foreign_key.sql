-- Add foreign key constraint to comments table for user_id
-- This establishes a proper relationship between comments and auth.users

-- Add foreign key constraint
ALTER TABLE comments 
ADD CONSTRAINT fk_comments_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index on user_id for better JOIN performance
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Update table comment to reflect the relationship
COMMENT ON COLUMN comments.user_id IS 'Foreign key to auth.users(id). NULL for anonymous users, SET NULL on user deletion';