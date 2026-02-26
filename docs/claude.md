# Claude Code 수칙 (Opus 4.6)

> Claude Code가 TestiFi 프로젝트에서 반드시 따라야 하는 규칙.

## 프로젝트 컨텍스트

- **프로젝트명**: TestiFi (테스티피)
- **개발 환경**: 안티그래비티 IDE
- **프레임워크**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **DB**: Supabase (PostgreSQL)
- **배포**: Vercel
- **개발자**: React/Next.js/TS에 능숙한 솔로 개발자. 설명보다 코드.

## 절대 수칙

```
[필수] TypeScript strict. any 금지. as any 금지. @ts-ignore 금지.
[필수] 함수형 컴포넌트 + Server Component 우선. 'use client'는 필요할 때만.
[필수] 파일당 하나의 책임. 200줄 초과 시 분리.
[필수] 한국어 주석. 변수/함수명은 영어.
[필수] 환경변수는 .env.local에서만. 코드에 키 하드코딩 절대 금지.
[필수] shadcn 컴포넌트 우선 사용. 직접 만들기 전에 shadcn에 있는지 확인.
[필수] console.log 금지. 개발용이라도 logger 유틸 사용.
```

## shadcn/ui 규칙

```bash
# 컴포넌트 추가 명령 (필요할 때만 하나씩)
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add progress
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add separator
```

```typescript
// ✅ shadcn 컴포넌트 import 경로
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// ✅ 브랜드 색상은 CSS 변수로 오버라이드 (globals.css에서)
// shadcn의 기본 색상 시스템을 Earthy Tones로 교체

// ❌ shadcn 컴포넌트 소스 직접 수정 금지 — className으로 오버라이드
```

**globals.css에 설정할 shadcn + Earthy Tones 테마:**

```css
@layer base {
  :root {
    /* Earthy Tones 팔레트 기반 shadcn 변수 오버라이드 */
    --background: 45 33% 96%;        /* #F5F0E8 크림 배경 */
    --foreground: 15 10% 25%;        /* #3D3632 다크 브라운 텍스트 */
    
    --card: 45 30% 98%;              /* #FAF7F2 카드 배경 */
    --card-foreground: 15 10% 25%;
    
    --primary: 95 25% 52%;           /* #9B9B5A 올리브 — 메인 브랜드 */
    --primary-foreground: 45 33% 96%;
    
    --secondary: 20 35% 68%;         /* #C4967A 살몬 — 보조 */
    --secondary-foreground: 15 10% 25%;
    
    --accent: 350 30% 60%;           /* #B57B86 로즈 — CTA/강조 */
    --accent-foreground: 45 33% 96%;
    
    --muted: 50 25% 90%;             /* #E8E2D0 뮤트 크림 */
    --muted-foreground: 15 10% 45%;
    
    --destructive: 0 60% 50%;
    --destructive-foreground: 0 0% 98%;
    
    --border: 40 20% 85%;            /* #DDD5C5 */
    --input: 40 20% 85%;
    --ring: 95 25% 52%;              /* 올리브 포커스 링 */
    
    --radius: 0.75rem;               /* 둥글지만 과하지 않게 */
  }
}
```

## Next.js 규칙

```typescript
// ✅ 서버 컴포넌트에서 데이터 페칭
export default async function TestPage({ params }: { params: { slug: string } }) {
  const test = await getTest(params.slug);
  return <TestClient test={test} />;
}

// ✅ 동적 메타데이터 (모든 페이지 필수)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const test = await getTest(params.slug);
  return {
    title: `${test.title} | TestiFi`,
    description: test.description,
    openGraph: {
      title: test.title,
      description: test.description,
      images: [{ url: test.ogImage, width: 1200, height: 630 }],
    },
  };
}

// ❌ 클라이언트에서 useEffect 데이터 페칭 — 서버에서 하라
```

- **App Router만 사용**. pages/ 생성 금지.
- **Image**: next/image 필수. 외부 이미지는 next.config.js remotePatterns 등록.
- **Font**: Pretendard를 next/font/local로 로드. swap 전략.

## 카카오톡 공유 구현

```typescript
// layout.tsx에서 SDK 로드
import Script from 'next/script';

<Script
  src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js"
  strategy="afterInteractive"
  onLoad={() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
    }
  }}
/>

// 공유 함수 — 반드시 Kakao.Share 사용 (Kakao.Link는 deprecated)
export function shareToKakao(result: TestResult) {
  if (!window.Kakao?.Share) return;
  
  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `나는 ${result.title}!`,
      description: result.shareText,
      imageUrl: result.ogImageUrl,  // 반드시 https:// 절대경로
      link: {
        mobileWebUrl: result.shareUrl,
        webUrl: result.shareUrl,
      },
    },
    buttons: [{
      title: '나도 테스트하기',
      link: {
        mobileWebUrl: result.testUrl,
        webUrl: result.testUrl,
      },
    }],
  });
}
```

**주의:**
- 카카오 개발자 콘솔에서 도메인 등록 필수 (localhost + 프로덕션)
- OG 이미지: https:// 절대경로. 상대경로 = 썸네일 안 뜸
- Kakao.Link 사용 시 즉시 Kakao.Share로 교체

## 테스트 데이터 스키마

```typescript
interface TestiFiTest {
  id: string;
  slug: string;                    // URL용 (예: "salary-type-2026")
  title: string;                   // "2026 나의 연봉 유형 테스트"
  description: string;
  ogImage: string;
  questions: Question[];           // 5~8개
  results: ResultType[];           // 4~8개
  createdAt: string;
  publishedAt: string | null;
  viewCount: number;
  shareCount: number;
  completionCount: number;
}

interface Question {
  id: number;
  text: string;
  emoji?: string;
  options: Option[];               // 2~4개
}

interface Option {
  id: string;
  text: string;
  scores: Record<string, number>;  // { "type_a": 3, "type_b": 1 }
}

interface ResultType {
  id: string;
  slug: string;
  title: string;
  emoji: string;
  description: string;             // 무료 (150~200자)
  detailedAnalysis: string;        // 프리미엄 유료
  compatibility: {
    best: string;                  // 최고 궁합 유형 ID
    worst: string;                 // 최악 궁합 유형 ID
  };
  ogImage: string;
  shareText: string;
}
```

## 성능 규칙

- **LCP < 2.5s, FID < 100ms, CLS < 0.1**
- 질문/결과 페이지 JS 번들 50KB 이하
- 이미지: WebP, 결과 카드 600x600 이하
- 폰트: Pretendard woff2만. swap 전략.
- 애드센스: `strategy="lazyOnload"`

## 파일 네이밍

```
컴포넌트:   PascalCase.tsx    (QuestionStep.tsx)
유틸리티:   camelCase.ts      (kakaoShare.ts)
shadcn UI:  kebab-case.tsx    (components/ui/button.tsx — shadcn 컨벤션)
API:        route.ts          (Next.js 컨벤션)
타입:       camelCase.ts      (test.ts)
```

## 절대 하지 말 것

- shadcn 컴포넌트 소스 파일 직접 수정 (className 오버라이드로 해결)
- 영어 주석
- any 타입
- 불필요한 'use client'
- 결과 페이지에 광고 2개 이상
- 질문 10개 이상
- 카카오 키 하드코딩
- styled-components, CSS modules 사용
