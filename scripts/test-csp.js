#!/usr/bin/env node

/**
 * CSP 테스트 스크립트 - Content Security Policy 위반 사항 자동 감지
 * 개발 환경에서 CSP 위반을 사전에 감지하여 프로덕션 배포 전 검증
 */

const puppeteer = require('puppeteer')

const CSP_VIOLATIONS = []

async function testCSP() {
  console.log('🔍 CSP 테스트 시작...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // CSP 위반 감지 리스너 등록
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('Content Security Policy') || text.includes('CSP')) {
        CSP_VIOLATIONS.push({
          type: 'console',
          message: text,
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Security Policy Violation 이벤트 감지
    await page.evaluateOnNewDocument(() => {
      document.addEventListener('securitypolicyviolation', e => {
        console.error('CSP Violation:', {
          blockedURI: e.blockedURI,
          violatedDirective: e.violatedDirective,
          effectiveDirective: e.effectiveDirective,
          originalPolicy: e.originalPolicy,
          lineNumber: e.lineNumber,
          columnNumber: e.columnNumber,
          sourceFile: e.sourceFile,
        })
      })
    })

    const testUrl = process.env.TEST_URL || 'http://localhost:3000'
    console.log(`📡 테스트 URL: ${testUrl}`)

    // 메인 페이지 테스트
    await page.goto(testUrl, { waitUntil: 'networkidle2' })

    // 게시글 페이지 테스트 (첫 번째 게시글)
    const postLinks = await page.$$eval(
      'a[href^="/"]',
      (links, baseUrl) =>
        links
          .map(link => link.href)
          .filter(
            href =>
              !href.includes('/tag/') &&
              !href.includes('/category/') &&
              href !== baseUrl + '/' &&
              href !== baseUrl + '/posts' &&
              href !== baseUrl + '/tags' &&
              href !== baseUrl + '/categories'
          )
          .slice(0, 1),
      testUrl
    )

    if (postLinks.length > 0) {
      console.log(`📄 게시글 페이지 테스트: ${postLinks[0]}`)
      await page.goto(postLinks[0], { waitUntil: 'networkidle2' })
    }

    // AdFit 광고 요소 확인
    const adElements = await page.$$('.kakao_ad_area')
    console.log(`📊 발견된 광고 요소: ${adElements.length}개`)

    // 결과 출력
    if (CSP_VIOLATIONS.length === 0) {
      console.log('✅ CSP 위반 사항이 발견되지 않았습니다.')
    } else {
      console.log(`⚠️  총 ${CSP_VIOLATIONS.length}개의 CSP 위반 사항 발견:`)
      CSP_VIOLATIONS.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.type.toUpperCase()}:`)
        console.log(`   시간: ${violation.timestamp}`)
        console.log(`   메시지: ${violation.message}`)
      })
    }
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message)
  } finally {
    await browser.close()
  }
}

// 직접 실행 시 테스트 시작
if (require.main === module) {
  testCSP().catch(console.error)
}

module.exports = { testCSP }
