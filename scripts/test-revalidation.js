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

Examples:
  node scripts/test-revalidation.js all
  node scripts/test-revalidation.js post-related
  node scripts/test-revalidation.js path "/,/posts,/tags"
  node scripts/test-revalidation.js tag "posts,homepage"

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

  await checkApiStatus()
  await testRevalidation()
}

main().catch(console.error)
