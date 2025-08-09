# TIL: Next.js Static Page Revalidation 해결 방안

## 문제 상황
정적으로 빌드된 페이지들이 포스트가 추가되거나 수정됐을 때의 결과가 반영되지 않는 문제
- 신규 포스트가 포스트 리스트에 포함되지 않음
- 태그가 삭제/추가됐을 때 해당 태그 페이지에 반영되지 않음

## 핵심 개념

### ISR (Incremental Static Regeneration)
- **개념**: 정적 사이트의 장점을 유지하면서도 콘텐츠를 주기적으로 업데이트하는 기술
- **작동 방식**: 
  - 빌드 시점에 페이지를 정적으로 생성
  - 설정된 시간(revalidate) 후 첫 번째 요청 시 백그라운드에서 페이지 재생성
  - 재생성이 완료되면 새로운 정적 페이지로 교체
- **장점**: 
  - 빠른 응답 속도 (CDN 캐싱 가능)
  - 자동적이고 점진적인 업데이트
  - 서버 부하 최소화
- **단점**: 
  - 즉시 업데이트 불가 (시간 간격 존재)
  - 첫 번째 방문자는 여전히 이전 버전을 볼 수 있음

### On-Demand Revalidation
- **개념**: 특정 이벤트나 요청에 따라 즉시 페이지를 재검증하고 업데이트하는 기술
- **작동 방식**:
  - API 엔드포인트를 통해 수동으로 재검증 트리거
  - `revalidatePath()` 또는 `revalidateTag()` 함수 호출
  - 즉시 백그라운드에서 페이지 재생성
- **장점**:
  - 즉시 업데이트 가능
  - 정확한 타이밍 제어
  - 필요한 페이지만 선택적 업데이트
- **단점**:
  - 수동 트리거 필요
  - API 엔드포인트 구현 필요
  - 보안 고려사항 (인증된 요청만 허용)

## 해결 방안

### 1. ISR (Time-based Revalidation)
```typescript
export const revalidate = 3600 // 1시간마다 재검증

export default async function Page() {
  const posts = await getPosts()
  return <div>{/* 포스트 렌더링 */}</div>
}
```

**특징:**
- 설정된 시간 간격마다 자동으로 페이지 재생성
- 구현이 간단하고 안정적
- 실시간성은 떨어지지만 대부분의 상황에 적합

**적용 대상:**
- 홈페이지 (최신 포스트 목록)
- 포스트 목록 페이지
- 태그/카테고리 페이지

### 2. On-Demand Revalidation API
```typescript
// app/api/revalidate/route.ts
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  
  if (path) {
    revalidatePath(path)
    return Response.json({ revalidated: true })
  }
  
  return Response.json({ message: 'Missing path' }, { status: 400 })
}
```

**특징:**
- API 호출을 통한 즉시 재검증
- 선택적이고 정확한 업데이트 가능
- 외부 시스템과의 연동 용이

**사용 시나리오:**
- 관리자가 수동으로 캐시 클리어
- CI/CD 파이프라인에서 배포 후 캐시 무효화
- 긴급한 내용 수정 후 즉시 반영

### 3. Notion Webhook + Revalidation
```typescript
// app/api/webhook/notion/route.ts
export async function POST(request: Request) {
  // Notion에서 전송된 webhook 데이터 처리
  const webhookData = await request.json()
  
  // 변경된 내용에 따라 관련 페이지들 재검증
  if (webhookData.type === 'page_created' || webhookData.type === 'page_updated') {
    await Promise.all([
      revalidatePath('/'),           // 홈페이지
      revalidatePath('/posts'),      // 포스트 목록
      revalidateTag('posts'),        // 포스트 관련 모든 페이지
    ])
  }
  
  return Response.json({ success: true })
}
```

**특징:**
- 콘텐츠 변경 시 자동으로 즉시 반영
- 사용자 경험 최적화
- 완전 자동화된 업데이트 프로세스

**구현 요소:**
- Notion API webhook 설정
- Webhook 엔드포인트 구현
- 보안 검증 (서명 확인)
- 에러 처리 및 재시도 로직

## 권장 하이브리드 접근법

**단계적 구현:**
1. **기본 ISR 설정**: 모든 주요 페이지에 `revalidate` 추가 (1시간 간격)
2. **On-Demand API**: 수동 캐시 클리어를 위한 API 엔드포인트 구현
3. **Webhook 통합**: Notion 변경사항 자동 반영 시스템 구축

**태그 기반 캐시 관리:**
```typescript
// 태그를 이용한 세밀한 캐시 제어
export default async function PostsPage() {
  const posts = await fetch('/api/posts', {
    next: { 
      revalidate: 3600,
      tags: ['posts', 'homepage'] 
    }
  })
  
  return <PostsList posts={posts} />
}

// 특정 태그만 재검증
revalidateTag('posts') // posts 태그가 있는 모든 페이지 재검증
```

## 결론
- **즉시 반영이 중요한 경우**: On-Demand Revalidation + Webhook
- **성능과 안정성이 중요한 경우**: ISR
- **최적의 사용자 경험**: 하이브리드 접근법

각 방식의 장단점을 고려하여 프로젝트 요구사항에 맞는 전략을 선택하는 것이 중요합니다.