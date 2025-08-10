#!/usr/bin/env node

/**
 * Revalidation API Test Script
 *
 * Usage:
 * node scripts/test-revalidation.js [type] [options]
 *
 * Examples:
 * node scripts/test-revalidation.js all
 * node scripts/test-revalidation.js post-related
 * node scripts/test-revalidation.js path /,/posts
 * node scripts/test-revalidation.js tag posts,homepage
 * node scripts/test-revalidation.js webhook [test-post-slug]
 */

const args = process.argv.slice(2)
const type = args[0] || 'all'
const options = args[1]

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' })

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

if (!REVALIDATE_SECRET) {
  console.error('❌ REVALIDATE_SECRET environment variable is not set')
  console.error('Add REVALIDATE_SECRET to your .env.local file')
  process.exit(1)
}

async function testRevalidation() {
  const url = `${SITE_URL}/api/revalidate?secret=${REVALIDATE_SECRET}`

  let body = { type }

  // 타입별 파라미터 설정
  switch (type) {
    case 'path':
      body.paths = options ? options.split(',') : ['/']
      break
    case 'tag':
      body.tags = options ? options.split(',') : ['posts']
      break
    case 'all':
    case 'post-related':
      // 추가 파라미터 불필요
      break
    default:
      console.error('❌ Invalid type. Use: all, post-related, path, or tag')
      process.exit(1)
  }

  console.log('🚀 Testing revalidation API...')
  console.log(`📍 URL: ${url}`)
  console.log(`📦 Body:`, JSON.stringify(body, null, 2))
  console.log('⏳ Sending request...\n')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Revalidation successful!')
      console.log('📊 Result:')
      console.log(JSON.stringify(result, null, 2))

      if (result.paths) {
        console.log('\n🔄 Revalidated paths:')
        result.paths.forEach(path => console.log(`  - ${path}`))
      }

      if (result.tags) {
        console.log('\n🏷️  Revalidated tags:')
        result.tags.forEach(tag => console.log(`  - ${tag}`))
      }
    } else {
      console.error('❌ Revalidation failed!')
      console.error('Status:', response.status)
      console.error('Response:', result)
    }
  } catch (error) {
    console.error('❌ Request failed:')
    console.error(error.message)
  }
}

// API 상태 확인
async function checkApiStatus() {
  try {
    const response = await fetch(`${SITE_URL}/api/revalidate`)
    const result = await response.json()

    console.log('🔍 API Status Check:')
    console.log(`Status: ${response.ok ? '✅ Online' : '❌ Offline'}`)
    console.log(`Timestamp: ${result.timestamp}`)
    console.log()
  } catch (error) {
    console.log('🔍 API Status: ❌ Unreachable')
    console.log()
  }
}

// 웹훅 테스트
async function testWebhook(postSlug = 'test-post') {
  const webhookSecret = process.env.NOTION_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('❌ NOTION_WEBHOOK_SECRET environment variable is not set')
    return
  }

  const sampleWebhookData = {
    source: 'notion-blog-webhook',
    data: {
      object: 'page',
      id: '24ba0048-876b-8033-b7dc-f08b33b85b33',
      created_time: '2025-08-10T09:26:00.000Z',
      last_edited_time: '2025-08-10T09:26:00.000Z',
      created_by: {
        object: 'user',
        id: 'cd94d69a-cd2d-4463-ba5a-b8ab0b289ab9',
      },
      last_edited_by: {
        object: 'user',
        id: '00000000-0000-0000-0000-000000000003',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'database_id',
        database_id: '22ea0048-876b-8043-9a70-f9f18d940761',
      },
      archived: false,
      in_trash: false,
      properties: {
        URLPath: {
          rich_text: [{ plain_text: postSlug }],
        },
        Tags: {
          multi_select: [
            { name: 'nextjs' },
            { name: 'test' },
            { name: 'webhook' },
          ],
        },
        Category: {
          select: { name: 'develop' },
        },
      },
      url: `https://www.notion.so/Test-page-24ba0048876b8033b7dcf08b33b85b33`,
      public_url: `https://ajy720.notion.site/Test-page-24ba0048876b8033b7dcf08b33b85b33`,
      request_id: '6a5d17e8-09ee-49fb-941f-c358c085d959',
    },
    timestamp: new Date().toISOString(),
  }

  try {
    console.log('🔔 Testing Notion webhook...')
    console.log(`📝 Sample post: ${postSlug}`)
    console.log(`🏷️  Tags: nextjs, test, webhook`)
    console.log(`📂 Category: develop`)

    const response = await fetch(`${SITE_URL}/api/webhook/notion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': webhookSecret,
        'x-source': 'notion-blog-webhook',
      },
      body: JSON.stringify(sampleWebhookData),
    })

    const result = await response.json()

    if (response.ok && result.success) {
      console.log('\n✅ Webhook processed successfully!')
      console.log(`📄 Page ID: ${result.page_id}`)

      if (result.post_details) {
        console.log('\n📋 Post Details:')
        console.log(`  URL Path: ${result.post_details.url_path}`)
        console.log(`  Tags: [${result.post_details.tags.join(', ')}]`)
        console.log(`  Category: ${result.post_details.category}`)
      }

      if (result.revalidated_paths) {
        console.log('\n🔄 Revalidated paths:')
        result.revalidated_paths.forEach(path => console.log(`  - ${path}`))
      }

      if (result.revalidated_tags) {
        console.log('\n🏷️  Revalidated tags:')
        result.revalidated_tags.forEach(tag => console.log(`  - ${tag}`))
      }
    } else {
      console.error('❌ Webhook test failed!')
      console.error('Status:', response.status)
      console.error('Response:', result)
    }
  } catch (error) {
    console.error('❌ Webhook test failed:')
    console.error(error.message)
  }
}

// 도움말 표시
function showHelp() {
  console.log(`
🛠️  Revalidation API Test Tool

Usage: node scripts/test-revalidation.js [type] [options]

Types:
  all           - Revalidate all main pages (/, /posts, /tags, /categories)
  post-related  - Revalidate all post-related pages (for new posts)
  path          - Revalidate specific paths (comma-separated)
  tag           - Revalidate by tags (comma-separated)
  webhook       - Test Notion webhook with sample data

Examples:
  node scripts/test-revalidation.js all
  node scripts/test-revalidation.js post-related
  node scripts/test-revalidation.js path "/,/posts,/tags"
  node scripts/test-revalidation.js tag "posts,homepage"
  node scripts/test-revalidation.js webhook

Environment:
  REVALIDATE_SECRET - Required secret key for API access
  NEXT_PUBLIC_SITE_URL - Site URL (defaults to http://localhost:3000)
`)
}

// 메인 실행
async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    return
  }

  if (type === 'webhook') {
    const postSlug = options || 'test-post'
    await testWebhook(postSlug)
  } else {
    await checkApiStatus()
    await testRevalidation()
  }
}

main().catch(console.error)
