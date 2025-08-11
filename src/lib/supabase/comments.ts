import { securityConfig } from '@/config/security.config'
import type {
  Comment,
  CommentFormData,
  CommentSubmissionResult,
  CommentWithProfileRPC,
} from '@/types/comments'

import { createClient } from './server'
import { createAdminClient } from './server-admin'

export async function getComments(notionPageId: string): Promise<Comment[]> {
  try {
    const supabase = await createClient()

    // Use RPC function to get comments with profiles
    const { data, error } = await supabase.rpc('get_comments_with_profiles', {
      page_id: notionPageId,
    })

    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }

    // Transform RPC result to Comment format
    const comments: Comment[] = (data as CommentWithProfileRPC[]).map(row => ({
      id: row.id,
      notion_page_id: row.notion_page_id,
      author_name: row.author_name,
      author_email: row.author_email,
      content: row.content,
      user_id: row.user_id,
      is_anonymous: row.is_anonymous,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_deleted: row.is_deleted,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      // Only include profile if we have complete profile data
      profile:
        row.profile_id && row.profile_display_name && row.profile_provider
          ? {
              id: row.profile_id,
              display_name: row.profile_display_name,
              avatar_url: row.profile_avatar_url || undefined,
              provider: row.profile_provider,
              created_at: row.profile_created_at || new Date().toISOString(),
              updated_at: row.profile_updated_at || new Date().toISOString(),
            }
          : undefined,
    }))

    return comments
  } catch (error) {
    console.error('Error in getComments:', error)
    return []
  }
}

export async function getCommentCount(notionPageId: string): Promise<number> {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('notion_page_id', notionPageId)
      .eq('is_deleted', false)

    if (error) {
      console.error('Error fetching comment count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error in getCommentCount:', error)
    return 0
  }
}

export async function createComment(
  formData: CommentFormData,
  notionPageId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<CommentSubmissionResult> {
  try {
    const supabase = await createClient()

    // Get current user (for anonymous auth)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const commentData = {
      notion_page_id: notionPageId,
      author_name: formData.authorName.trim(),
      author_email: formData.authorEmail?.trim() || null,
      content: formData.content.trim(),
      user_id: user?.id || null,
      is_anonymous: !user || user.is_anonymous,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    }

    const { data, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return {
        success: false,
        error: 'Failed to submit comment. Please try again.',
      }
    }

    return {
      success: true,
      comment: data,
    }
  } catch (error) {
    console.error('Error in createComment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

export async function checkRateLimit(ipAddress: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Check comments from this IP in the last hour
    const oneHourAgo = new Date(
      Date.now() - securityConfig.rateLimit.comments.windowMs
    ).toISOString()

    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ipAddress)
      .gte('created_at', oneHourAgo)

    if (error) {
      console.error('Error checking rate limit:', error)
      // Allow submission if we can't check (fail open for better UX)
      return true
    }

    // Allow max comments per hour based on security config
    return (count || 0) < securityConfig.rateLimit.comments.maxPerHour
  } catch (error) {
    console.error('Error in checkRateLimit:', error)
    // Allow submission if error occurs
    return true
  }
}

export async function softDeleteComment(
  commentId: string,
  userId?: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .eq('user_id', userId || '')

    if (error) {
      console.error('Error soft deleting comment:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in softDeleteComment:', error)
    return false
  }
}

export async function transferAnonymousComments(
  currentAnonymousUserId: string,
  authenticatedUserId: string,
  authenticatedUserName?: string,
  authenticatedUserEmail?: string
): Promise<boolean> {
  try {
    // Use admin client to bypass RLS for this administrative operation
    const adminSupabase = createAdminClient()

    // First, check if there are any comments to transfer
    const { data: commentsToTransfer, error: selectError } = await adminSupabase
      .from('comments')
      .select('id, author_name, author_email, user_id, is_anonymous')
      .eq('user_id', currentAnonymousUserId)
      .eq('is_anonymous', true)

    if (selectError) {
      console.error('Error querying comments to transfer:', selectError)
      return false
    }

    if (!commentsToTransfer || commentsToTransfer.length === 0) {
      return true
    }

    // Prepare update data with author information
    const updateData: {
      user_id: string
      is_anonymous: boolean
      author_name?: string
      author_email?: string
    } = {
      user_id: authenticatedUserId,
      is_anonymous: false,
    }

    // Update author info with authenticated user profile if available
    if (authenticatedUserName) {
      updateData.author_name = authenticatedUserName
    }
    if (authenticatedUserEmail) {
      updateData.author_email = authenticatedUserEmail
    }

    // Perform the update using admin client (bypasses RLS)
    const { error: updateError } = await adminSupabase
      .from('comments')
      .update(updateData)
      .eq('user_id', currentAnonymousUserId)
      .eq('is_anonymous', true)

    if (updateError) {
      console.error('Error transferring anonymous comments:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in transferAnonymousComments:', error)
    return false
  }
}
