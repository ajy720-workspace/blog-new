-- Create RPC function to get comments with profiles
-- This solves the relationship issue by using a stored procedure

CREATE OR REPLACE FUNCTION get_comments_with_profiles(page_id TEXT)
RETURNS TABLE (
  id UUID,
  notion_page_id VARCHAR,
  author_name VARCHAR,
  author_email VARCHAR,
  content TEXT,
  user_id UUID,
  is_anonymous BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN,
  ip_address INET,
  user_agent TEXT,
  profile_id UUID,
  profile_display_name TEXT,
  profile_avatar_url TEXT,
  profile_provider TEXT,
  profile_created_at TIMESTAMP WITH TIME ZONE,
  profile_updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.notion_page_id,
    c.author_name,
    c.author_email,
    c.content,
    c.user_id,
    c.is_anonymous,
    c.created_at,
    c.updated_at,
    c.is_deleted,
    c.ip_address,
    c.user_agent,
    p.id as profile_id,
    p.display_name as profile_display_name,
    p.avatar_url as profile_avatar_url,
    p.provider as profile_provider,
    p.created_at as profile_created_at,
    p.updated_at as profile_updated_at
  FROM comments c
  LEFT JOIN profiles p ON c.user_id = p.id
  WHERE c.notion_page_id = page_id 
    AND c.is_deleted = false
  ORDER BY c.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_comments_with_profiles(TEXT) TO anon, authenticated;