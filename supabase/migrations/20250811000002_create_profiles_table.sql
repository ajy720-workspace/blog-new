-- Create profiles table for multi-provider user profile management
-- This table normalizes user profile information from various OAuth providers

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON profiles(provider);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
-- Anyone can read profiles (for displaying comment authors)
CREATE POLICY "Anyone can read profiles" ON profiles
    FOR SELECT USING (true);

-- Users can only insert/update their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Function to handle profile upserts (create or update)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the upsert function
GRANT EXECUTE ON FUNCTION upsert_profile(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;