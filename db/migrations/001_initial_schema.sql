CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  provider TEXT,
  provider_user_id TEXT,
  user_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT app_users_provider_identity_unique UNIQUE (provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notion_page_id VARCHAR NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  CONSTRAINT check_author_name_length CHECK (char_length(author_name) >= 1 AND char_length(author_name) <= 100),
  CONSTRAINT check_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notion_page_id VARCHAR NOT NULL,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  anonymous_session_id UUID,
  anonymous_browser_id UUID,
  ip_address INET,
  user_agent TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_users_provider_identity ON app_users(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_app_users_is_anonymous ON app_users(is_anonymous);

CREATE INDEX IF NOT EXISTS idx_profiles_provider ON profiles(provider);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_notion_page_id ON comments(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_deleted ON comments(is_deleted);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

CREATE INDEX IF NOT EXISTS idx_likes_notion_page_id ON likes(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_anonymous_session_id ON likes(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_likes_anonymous_browser_id ON likes(anonymous_browser_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_user_post
  ON likes(notion_page_id, user_id)
  WHERE user_id IS NOT NULL AND is_anonymous = false;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_likes_updated_at ON likes;
CREATE TRIGGER update_likes_updated_at
  BEFORE UPDATE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION upsert_profile(
  user_id UUID,
  user_display_name TEXT,
  user_avatar_url TEXT,
  user_provider TEXT
)
RETURNS profiles AS $$
DECLARE
  result profiles;
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url, provider, created_at, updated_at)
  VALUES (user_id, user_display_name, user_avatar_url, user_provider, NOW(), NOW())
  ON CONFLICT (id)
  DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    provider = EXCLUDED.provider,
    updated_at = NOW()
  RETURNING * INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_comments_with_profiles(page_id TEXT)
RETURNS TABLE (
  id UUID,
  notion_page_id VARCHAR,
  author_name VARCHAR,
  author_email VARCHAR,
  content TEXT,
  user_id UUID,
  is_anonymous BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  is_deleted BOOLEAN,
  ip_address INET,
  user_agent TEXT,
  profile_id UUID,
  profile_display_name TEXT,
  profile_avatar_url TEXT,
  profile_provider TEXT,
  profile_created_at TIMESTAMPTZ,
  profile_updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
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
    p.id AS profile_id,
    p.display_name AS profile_display_name,
    p.avatar_url AS profile_avatar_url,
    p.provider AS profile_provider,
    p.created_at AS profile_created_at,
    p.updated_at AS profile_updated_at
  FROM comments c
  LEFT JOIN profiles p ON c.user_id = p.id
  WHERE c.notion_page_id = page_id
    AND c.is_deleted = false
  ORDER BY c.created_at DESC;
END;
$$;
