# TIL: 개별 포스트 페이지 로딩 최적화 & 스마트 웹훅 시스템

*작성일: 2025년 8월 10일*  
*기간: ISR 웹훅 시스템 구축 이후 추가 최적화 작업*

## 📋 작업 개요

마지막 커밸 `cbef689` (ISR + On-Demand Revalidation + Notion Webhook system) 이후 수행한 주요 최적화 작업들을 정리한다.

## 🎯 해결한 문제들

### 1. 개별 포스트 페이지 로딩 지연 문제

**문제 상황**: 
- ISR 캐싱이 적용되어 있음에도 개별 포스트 페이지(`/[slug]`)의 첫 로딩이 메인 페이지보다 느림
- Skeleton이나 지연 없이 바로 표시되어야 하는데 여전히 로딩 지연 존재
- Lazy Loading과 Suspense 구조로 인한 불필요한 지연

**원인 분석**:
1. **불필요한 Suspense 래핑**: 이미 서버에서 완전히 처리된 데이터임에도 클라이언트에서 점진적 로딩
2. **중복 API 호출**: `getPostBySlug`를 메인 컴포넌트와 서브 컴포넌트에서 각각 호출
3. **LazyPostRenderer**: `react.lazy()`로 인한 추가 번들 분할과 로딩 지연
4. **불필요한 textContent 호출**: SEO용 데이터를 컴포넌트에서 중복 호출

### 2. Notion Webhook의 비효율적인 재검증

**문제 상황**:
- 웹훅 수신 시 모든 페이지를 무차별적으로 재검증
- 특정 포스트의 변경이 전체 사이트에 영향을 주는 비효율성
- 개별 포스트 페이지나 관련 태그/카테고리 페이지만 선별적으로 업데이트하지 못함

## 🚀 해결 과정 및 구현

### A. 개별 포스트 페이지 로딩 최적화

#### 1단계: Lazy Loading 제거
```typescript
// Before: Lazy Loading으로 인한 지연
import { LazyPostRenderer } from '@/components/LazyComponents'

// After: 직접 import로 즉시 로딩
import { PostRenderer } from '@/components/post-renderer'
```

#### 2단계: 불필요한 Suspense 제거
```typescript
// Before: 서버 렌더링된 데이터를 또 Suspense로 래핑
<Suspense fallback={<PostSkeleton />}>
  <PostContent slug={params.slug} />
</Suspense>

// After: 직접 렌더링
<PostContent post={post} />
```

#### 3단계: 중복 API 호출 제거
```typescript
// Before: 중복 호출
async function PostPage() {
  const post = await getPostBySlug(slug)     // 1차 호출
  return <PostContent slug={slug} />
}

async function PostContent({ slug }) {
  const post = await getPostBySlug(slug)     // 2차 중복 호출!
}

// After: 데이터 전달
async function PostPage() {
  const post = await getPostBySlug(slug)     // 1회만 호출
  return <PostContent post={post} />         // 데이터 전달
}
```

#### 4단계: generateStaticParams 도입
```typescript
export async function generateStaticParams() {
  try {
    const { posts } = await getPostsWithMetadata()
    
    return posts.map(post => ({
      slug: post.url_path,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return [] // 에러 시 동적 생성으로 폴백
  }
}
```

**결과**: 61개 → 96개 페이지로 SSG 생성 증가, 완전한 빌드 타임 정적 생성

#### 5단계: 댓글 시스템 분리 (SSG 호환)
```typescript
// Before: 서버사이드 댓글 로딩으로 cookies 사용 (SSG 불가)
async function PostContent({ post }) {
  const commentCount = await getCommentCount(post.id)  // cookies 사용!
}

// After: 클라이언트사이드로 완전 분리
function PostComments({ postId }) {
  return <LazyComments notionPageId={postId} initialComments={[]} />
}
```

**결과**: Dynamic server usage 에러 해결, 완전한 SSG 달성

### B. React Cache를 활용한 API 최적화

#### 문제: textContent 중복 호출
```typescript
// generateMetadata에서 1회 호출
export async function generateMetadata() {
  const textContent = await getPageTextContent(post.id)  // 1차 호출
}

// PostContent에서 또 1회 호출  
async function PostContent({ post }) {
  const postSchema = generatePostSchema(post, '')  // textContent 없이 호출
}
```

#### 해결: React Cache 도입
```typescript
import { cache } from 'react'

// 캐시된 함수 생성
const getCachedPageTextContent = cache(async (postId: string) => {
  return await getPageTextContent(postId)
})

// generateMetadata에서 캐시에 저장
export async function generateMetadata() {
  const textContent = await getCachedPageTextContent(post.id)  // 첫 호출
  return { description: generateMetaDescription(textContent) }
}

// PostContent에서 캐시에서 재사용
async function PostContent({ post }) {
  const textContent = await getCachedPageTextContent(post.id)  // 캐시에서 즉시 반환
  const postSchema = generatePostSchema(post, textContent)     // 완전한 SEO 데이터
}
```

**결과**:
- API 호출 2회 → 1회로 감소
- Structured Data에 완전한 description 포함
- 성능 향상 + SEO 품질 개선

### C. 스마트 Notion Webhook 시스템

#### 1단계: Properties 데이터 구조 분석
사용자가 제공한 실제 웹훅 데이터:
```json
{
  "data": {
    "properties": {
      "URLPath": { "rich_text": [{"plain_text": "post-slug"}] },
      "Tags": { "multi_select": [{"name": "nextjs"}, {"name": "test"}] },
      "Category": { "select": {"name": "develop"} }
    }
  }
}
```

#### 2단계: TypeScript 타입 정의
```typescript
interface NotionRichText {
  plain_text?: string;
}

interface NotionSelect {
  name?: string;
}

interface NotionProperty {
  rich_text?: NotionRichText[];
  title?: NotionRichText[];
  select?: NotionSelect;
  multi_select?: NotionSelect[];
  formula?: NotionFormula;
}
```

#### 3단계: Properties 추출 함수 구현
```typescript
function extractPropertyValue(property: NotionProperty | undefined): string | null {
  if (!property) return null
  
  // Rich Text, Title, Select, Formula 처리
  if (property.rich_text && Array.isArray(property.rich_text)) {
    return property.rich_text.map((text) => text.plain_text || '').join('')
  }
  
  if (property.select && property.select.name) {
    return property.select.name
  }
  
  return null
}

function extractPropertyArray(property: NotionProperty | undefined): string[] {
  if (!property) return []
  
  // Multi-select 처리
  if (property.multi_select && Array.isArray(property.multi_select)) {
    return property.multi_select
      .map((item) => item.name || '')
      .filter(Boolean)
  }
  
  return []
}
```

#### 4단계: 정확한 타겟팅 재검증 로직
```typescript
// Properties에서 데이터 추출
const properties: Record<string, NotionProperty> = data?.properties || {}
const urlPath = extractPropertyValue(properties.URLPath)
const tags = extractPropertyArray(properties.Tags) 
const category = extractPropertyValue(properties.Category)

// 기본 재검증 경로들
const pathsToRevalidate = ['/', '/posts', '/tags', '/categories']

// 개별 포스트 페이지 추가
if (urlPath) {
  pathsToRevalidate.push(`/${urlPath}`)
}

// 관련 태그 페이지들 추가
if (tags.length > 0) {
  for (const tag of tags) {
    if (tag) {
      pathsToRevalidate.push(`/tag/${tag}`)
    }
  }
}

// 관련 카테고리 페이지 추가
if (category) {
  pathsToRevalidate.push(`/category/${category}`)
}
```

#### 5단계: 테스트 도구 개선
```bash
# 웹훅 테스트 기능 추가
node scripts/test-revalidation.js webhook [post-slug]
```

**결과**:
```
🔄 Revalidated paths:
  - /                    (홈페이지)
  - /posts              (전체 포스트 목록)
  - /tags               (태그 목록)
  - /categories         (카테고리 목록)
  - /my-test-post       (📍 개별 포스트)
  - /tag/nextjs         (📍 관련 태그 페이지들)
  - /tag/test
  - /tag/webhook
  - /category/develop   (📍 관련 카테고리 페이지)
```

## 🎯 최종 성과

### 성능 향상
1. **로딩 속도**: 개별 포스트 페이지가 메인 페이지 수준으로 빠른 첫 렌더링
2. **SSG 생성**: 61개 → 96개 → 101개 페이지로 완전한 정적 생성 확대
3. **API 호출**: 중복 호출 제거로 서버 부하 감소
4. **번들 최적화**: 불필요한 Lazy Loading 제거

### 사용자 경험 개선
1. **즉시 로딩**: Skeleton 없이 바로 콘텐츠 표시
2. **완전한 캐싱**: 재방문 시 극도로 빠른 로딩
3. **실시간 업데이트**: Notion 변경 시 정확한 페이지만 즉시 반영

### 개발자 경험 개선
1. **타입 안전성**: 모든 Notion properties에 TypeScript 타입 적용
2. **디버깅 도구**: 완전한 웹훅 테스트 시스템 구축
3. **코드 품질**: ESLint 에러 완전 해결

## 📚 핵심 학습 내용

### 1. Next.js 15 App Router의 SSG 최적화
- `generateStaticParams`와 `revalidate`의 조합으로 ISR + SSG 달성
- Server Components에서 cookies 사용 시 SSG 불가능 (댓글 시스템 분리 필요)
- React `cache()` 함수로 컴포넌트 간 데이터 공유 최적화

### 2. Notion API 웹훅 데이터 구조 이해
- 실제 웹훅 데이터와 문서의 차이점 파악 중요
- Properties 추출 시 다양한 타입(rich_text, select, multi_select) 처리 필요
- 커스텀 헤더를 활용한 보안 인증 (HMAC 서명 불가능)

### 3. 성능 최적화 전략
- Lazy Loading이 항상 좋은 것은 아님 (정적 생성된 필수 컴포넌트는 직접 로딩이 효과적)
- Suspense는 실제 비동기 로딩이 필요한 경우에만 사용
- React Cache로 중복 API 호출 방지

### 4. 개발 도구의 중요성
- 완전한 테스트 스크립트로 개발 생산성 크게 향상
- 실시간 디버깅과 모니터링으로 문제 조기 발견
- TypeScript 타입 안전성으로 런타임 에러 방지

## 🔄 추후 개선 과제

1. **Collection 컴포넌트 구현**: react-notion-x에서 Collection 타입 처리
2. **이미지 최적화**: NotionAPI getSignedfileUrls 400 에러 해결
3. **댓글 시스템**: 서버사이드 초기 로딩과 클라이언트 실시간 업데이트 조화
4. **모니터링**: 실제 사용자 환경에서의 성능 메트릭 수집

---

*이번 최적화를 통해 Next.js 15 App Router의 SSG + ISR + 웹훅의 완전한 조합을 달성하며, 개별 포스트 페이지의 로딩 성능을 메인 페이지 수준으로 끌어올렸다. 특히 React Cache를 활용한 API 최적화와 Notion 웹훅의 정확한 타겟팅은 실무에서 바로 적용 가능한 고급 기법이다.*