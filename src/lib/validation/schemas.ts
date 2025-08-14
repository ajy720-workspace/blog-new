import { z } from 'zod'

export const commentSchema = z.object({
  authorName: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9가-힣\s._-]+$/, 'Name contains invalid characters'),
  authorEmail: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(2000, 'Comment must be less than 2000 characters')
    .refine(
      content => content.trim().length > 0,
      'Comment cannot be empty or contain only whitespace'
    ),
})

export const webhookSecretSchema = z.object({
  'x-webhook-secret': z.string().min(1, 'Webhook secret is required'),
  'x-source': z.string().optional(),
  'content-type': z.string().includes('application/json'),
})

export const revalidateRequestSchema = z.object({
  type: z.enum(['path', 'tag', 'all', 'post-related']),
  paths: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required')
    .optional(),
  NOTION_API_KEY: z.string().min(1, 'Notion API key is required'),
  NOTION_DATABASE_ID: z.string().min(1, 'Notion database ID is required'),
  REVALIDATE_SECRET: z.string().min(1, 'Revalidate secret is required'),
  NOTION_WEBHOOK_SECRET: z.string().min(1, 'Notion webhook secret is required'),
  NEXT_PUBLIC_SITE_URL: z.string().url('Invalid site URL').optional(),
})

export const ipAddressSchema = z
  .string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    'Invalid IP address format'
  )

export const userAgentSchema = z.string().max(1000, 'User agent too long')

export type CommentFormData = z.infer<typeof commentSchema>
export type WebhookHeaders = z.infer<typeof webhookSecretSchema>
export type RevalidateRequest = z.infer<typeof revalidateRequestSchema>
export type EnvVariables = z.infer<typeof envSchema>
