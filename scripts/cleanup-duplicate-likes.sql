-- Cleanup script for existing duplicate likes
-- This script identifies and removes duplicate likes, keeping the most recent one per user per post

-- First, let's identify all duplicate likes grouped by user and post
WITH duplicate_likes AS (
  SELECT 
    notion_page_id,
    COALESCE(user_id::text, 'anonymous') as user_key,
    CASE 
      WHEN user_id IS NOT NULL THEN user_id::text
      ELSE COALESCE(anonymous_session_id, anonymous_browser_id, 'unknown')
    END as identifier,
    COUNT(*) as like_count,
    array_agg(id ORDER BY created_at DESC) as like_ids,
    array_agg(created_at ORDER BY created_at DESC) as like_timestamps
  FROM likes 
  GROUP BY notion_page_id, user_key, identifier
  HAVING COUNT(*) > 1
),
likes_to_delete AS (
  SELECT 
    notion_page_id,
    user_key,
    identifier,
    like_count,
    like_ids[2:] as ids_to_delete,  -- Keep the first (most recent), delete the rest
    like_ids[1] as id_to_keep
  FROM duplicate_likes
)
-- Show what would be deleted (for review)
SELECT 
  d.notion_page_id,
  d.user_key,
  d.identifier,
  d.like_count as total_duplicates,
  array_length(d.ids_to_delete, 1) as will_delete_count,
  d.id_to_keep as keeping_like_id,
  l.created_at as keeping_created_at,
  l.is_anonymous as keeping_is_anonymous
FROM likes_to_delete d
JOIN likes l ON l.id = d.id_to_keep
ORDER BY d.notion_page_id, d.user_key;

-- To actually delete the duplicates, uncomment the following:
/*
WITH duplicate_likes AS (
  SELECT 
    notion_page_id,
    COALESCE(user_id::text, 'anonymous') as user_key,
    CASE 
      WHEN user_id IS NOT NULL THEN user_id::text
      ELSE COALESCE(anonymous_session_id, anonymous_browser_id, 'unknown')
    END as identifier,
    COUNT(*) as like_count,
    array_agg(id ORDER BY created_at DESC) as like_ids
  FROM likes 
  GROUP BY notion_page_id, user_key, identifier
  HAVING COUNT(*) > 1
),
likes_to_delete AS (
  SELECT 
    unnest(like_ids[2:]) as id_to_delete  -- Keep the first (most recent), delete the rest
  FROM duplicate_likes
)
DELETE FROM likes 
WHERE id IN (SELECT id_to_delete FROM likes_to_delete);
*/