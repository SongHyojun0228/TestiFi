# 기술 스택

## 아키텍처 개요

```
┌─────────────────────────────────────────────┐
│                Frontend                       │
│  Next.js 14 (App Router) + TypeScript        │
│  Tailwind CSS + shadcn/ui (Earthy Theme)     │
│  Kakao JS SDK + GA4                          │
├─────────────────────────────────────────────┤
│                Backend                        │
│  Next.js API Routes (Serverless)             │
│  Anthropic Claude API (테스트 자동생성)       │
├─────────────────────────────────────────────┤
│                Database                       │
│  Supabase (PostgreSQL + Storage)             │
├─────────────────────────────────────────────┤
│                Deploy                         │
│  Vercel (호스팅 + Edge + Cron)               │
├─────────────────────────────────────────────┤
│                Monetization                   │
│  Google AdSense + Toss Payments (Phase 2)    │
└─────────────────────────────────────────────┘
```

---

## 상세 스택

### Next.js 14+ (App Router)

```
선택 이유:
  - Server Components → 빠른 초기 로딩 + SEO + 카카오 OG
  - Dynamic Metadata API → 테스트/유형별 OG 태그 필수
  - API Routes → 별도 백엔드 불필요 (1인 운영)
  - Vercel 네이티브 배포
  - ISR → 테스트 페이지 캐싱
```

### TypeScript (Strict)

```
tsconfig: strict: true, noImplicitAny: true, strictNullChecks: true
이유: 테스트 데이터 스키마가 복잡해서 타입 안전성 필수
```

### Tailwind CSS + shadcn/ui

```
shadcn 사용 컴포넌트:
  - Button (선택지, CTA, 공유)
  - Card (질문 카드, 결과 카드, 테스트 목록)
  - Progress (진행률)
  - Badge (유형 태그, 인기 테스트 뱃지)
  - Dialog (프리미엄 분석 미리보기)
  - Separator (섹션 구분)
  - Skeleton (로딩 상태)

테마 커스터마이징:
  - globals.css에서 shadcn CSS 변수를 Earthy Tones로 오버라이드
  - brand.md의 색상 시스템 적용
  - --radius: 0.75rem (둥글지만 과하지 않게)

Tailwind 플러그인:
  - @tailwindcss/typography (결과 설명 텍스트)
  - tailwindcss-animate (shadcn 기본 포함)
```

### Supabase

```
사용 기능:
  - PostgreSQL: 테스트/분석/결제 데이터
  - Storage: 결과 이미지 (result-images 버킷)
  - Auth/Realtime: 사용 안 함

무료 tier: 500MB DB, 1GB Storage, 50K API/월

테이블:
  tests (id, slug, title, description, og_image, questions, results, 
         created_at, published_at, view_count, share_count, completion_count)
  analytics (id, test_slug, event_type, result_type, referrer, metadata, created_at)
  premium_purchases (id, test_slug, result_type, payment_id, amount, created_at)
```

### Anthropic Claude API

```
모델:   claude-sonnet-4-5-20250929 (비용 효율)
용도:   테스트 자동생성 (주 3회) + 프리미엄 분석 (온디맨드)
비용:   ~$3-5/월 (약 5,000원)
SDK:    @anthropic-ai/sdk
주의:   서버 사이드에서만 사용. 클라이언트 노출 금지.
```

### 카카오톡 공유 (Kakao JS SDK)

```
버전:   2.7.9+
CDN:    https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js
비용:   무료

필요 설정:
  1. developers.kakao.com → 앱 등록 → JS 키 발급
  2. 플랫폼 > Web > 도메인 등록 (localhost + 프로덕션)
  3. Kakao.Share.sendDefault (feed 타입)

주의:
  - Kakao.Link는 deprecated → Kakao.Share 사용
  - OG 이미지는 https:// 절대경로 필수
```

### Vercel

```
플랜:   Hobby (무료) → Pro ($20/월)
설정:   GitHub 자동배포, 환경변수, 커스텀 도메인
Cron:   주 3회 자동 테스트 생성

무료 한도: 100GB 대역폭, 100시간 서버리스, 1K 이미지 최적화
```

### Google AdSense

```
위치:       결과 페이지에만 1개
형식:       모바일 인피드/네이티브, 데스크탑 디스플레이
로딩:       strategy="lazyOnload"
승인 조건:  오리지널 콘텐츠 + 일 100+ 방문 + 개인정보처리방침
```

### Toss Payments (Phase 2)

```
용도:       프리미엄 상세분석 1,900원 단건결제
SDK:        @tosspayments/payment-sdk
결제수단:   카드, 카카오페이, 네이버페이, 토스페이
```

### Google Analytics 4

```
측정 ID:    G-XXXXXXXXXX
커스텀 이벤트: marketing.md의 이벤트 목록 참조
커스텀 차원:   test_slug, result_type, share_channel
```

---

## 개발 환경

```
IDE:           안티그래비티 (AntiGravity)
AI:            Claude Opus 4.6 (주) + Gemini 3.1 Pro (보조)
Node.js:       20.x LTS
패키지매니저:   pnpm
포맷:          ESLint + Prettier (Next.js 기본)
Git:           GitHub → Vercel 자동배포
```

### npm 패키지

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "@anthropic-ai/sdk": "^0.30.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

**class-variance-authority, clsx, tailwind-merge, lucide-react**는 shadcn/ui 필수 의존성.
이 외 패키지는 필요성 검토 후에만 설치.

---

## 환경변수

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Kakao
NEXT_PUBLIC_KAKAO_JS_KEY=

# Anthropic (서버 전용)
ANTHROPIC_API_KEY=

# Google Analytics
NEXT_PUBLIC_GA_ID=

# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADSENSE_SLOT_ID=

# Site
NEXT_PUBLIC_SITE_URL=https://testifi.kr

# Admin
ADMIN_PASSWORD=

# Toss Payments (Phase 2)
# NEXT_PUBLIC_TOSS_CLIENT_KEY=
# TOSS_SECRET_KEY=
```
