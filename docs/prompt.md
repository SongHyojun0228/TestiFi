# 프롬프트 모음

> 복사-붙여넣기로 바로 사용 가능.

---

## Phase 1: 프로젝트 초기 세팅

### → Claude Code

```
TestiFi 프로젝트를 초기 세팅해줘.

프로젝트 루트의 claude.md, role.md, tool.md, brand.md를 먼저 읽고 수칙을 따라.

순서:
1. Next.js 14 App Router + TypeScript + Tailwind CSS 프로젝트 생성 (pnpm)
2. shadcn/ui 초기화 + Earthy Tones 테마 적용
   - components.json 생성
   - globals.css에 claude.md에 정의된 CSS 변수 적용
   - 필수 컴포넌트 설치: button, card, progress, badge, separator, dialog
3. Supabase 연동
   - tests 테이블: id(uuid PK), slug(text UNIQUE), title, description, og_image, questions(jsonb), results(jsonb), created_at, published_at(nullable), view_count(int default 0), share_count(int default 0), completion_count(int default 0)
   - analytics 테이블: id(uuid PK), test_slug(text), event_type(text), result_type(text nullable), referrer(text nullable), metadata(jsonb), created_at
   - premium_purchases 테이블: id(uuid PK), test_slug, result_type, payment_id, amount(int), created_at
4. src/types/test.ts — claude.md의 TypeScript 스키마
5. src/lib/supabase/server.ts, src/lib/supabase/client.ts
6. src/lib/utils.ts — cn() 함수 (shadcn 유틸)
7. layout.tsx — 카카오 SDK + GA4 + Pretendard(next/font/local) + shadcn ThemeProvider
8. tailwind.config.ts — brand.md 색상 확장
9. next.config.js — Supabase Storage 이미지 도메인

.env.local.example:
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  NEXT_PUBLIC_KAKAO_JS_KEY=
  ANTHROPIC_API_KEY=
  NEXT_PUBLIC_GA_ID=
  NEXT_PUBLIC_SITE_URL=
  ADMIN_PASSWORD=
```

### → Gemini

```
TestiFi의 첫 시드 테스트 5개를 만들어줘.

gemini.md를 먼저 읽고 바이럴 테스트 황금 공식을 따라.

JSON 구조:
{
  "slug": "url-slug",
  "title": "테스트 제목",
  "description": "한 줄 설명 30자",
  "questions": [
    {
      "id": 1,
      "text": "질문",
      "emoji": "🎯",
      "options": [
        { "id": "q1_a", "text": "선택지", "scores": { "type_a": 3, "type_b": 1 } }
      ]
    }
  ],
  "results": [
    {
      "id": "type_a",
      "slug": "type-a-slug",
      "title": "유형 이름",
      "emoji": "🔥",
      "description": "무료 설명 150-200자 (긍정 80% + 찔림 20%)",
      "detailedAnalysis": "프리미엄 상세분석 400-500자",
      "compatibility": { "best": "type_b", "worst": "type_c" },
      "shareText": "카카오 공유용 한줄"
    }
  ]
}

5개 주제:
1. "2026 나의 연봉 유형 테스트" — 직장인+대학생
2. "나의 카페 소비 유형 테스트" — 카페 자주 가는 2030
3. "나의 여행 스타일 테스트" — 봄 여행 시즌
4. "나의 연애 결제 유형 테스트" — 데이트 비용 논쟁
5. "직장에서 나의 생존 유형 테스트" — 직장인 공감

각 테스트: 질문 6개, 결과 유형 6개.
```

---

## Phase 2: 핵심 기능 개발

### → Claude Code: 테스트 진행 페이지

```
테스트 진행 페이지를 만들어줘.

파일:
  src/app/test/[slug]/page.tsx (서버 컴포넌트)
  src/components/test/TestClient.tsx ('use client')
  src/components/test/QuestionStep.tsx
  src/components/test/ProgressBar.tsx

기능:
1. [slug]로 Supabase에서 테스트 조회 (서버)
2. 질문 1개씩 표시 (shadcn Card 사용)
3. 선택지 클릭 → 다음 질문 (fade 트랜지션)
4. shadcn Progress로 진행률 표시
5. 마지막 답변 → 점수 합산 → 최고 점수 유형 → /test/[slug]/result/[type]로 리다이렉트
6. 점수 계산: answers의 scores 누적 합산, 동점이면 먼저 나온 유형
7. analytics 이벤트: test_start, question_answer, test_complete
8. generateMetadata로 테스트별 OG 태그

shadcn 컴포넌트 활용:
  - Card: 질문 카드
  - Button: 선택지 버튼 (variant="outline", 선택 시 variant="default")
  - Progress: 상단 진행률
```

### → Claude Code: 결과 페이지

```
결과 페이지를 만들어줘.

파일:
  src/app/test/[slug]/result/[type]/page.tsx (서버)
  src/components/test/ResultClient.tsx ('use client')
  src/components/test/ResultCard.tsx
  src/components/test/ShareButtons.tsx
  src/lib/kakao.ts

레이아웃 (위→아래):
1. 결과 카드 (shadcn Card)
   - 이모지 크게 + 유형명 + 설명 + 궁합
2. 공유 버튼 (스크롤 없이 보여야 함)
   - 카카오톡 (카카오 노란색, 가장 크게)
   - 링크 복사
   - X(트위터)
   - 인스타 이미지 다운로드
3. 프리미엄 상세분석 (shadcn Dialog로 블러 미리보기)
   - "더 자세한 분석이 궁금하다면?" CTA
   - 1,900원 단건결제 (Phase 2)
4. 애드센스 1개
5. 다른 테스트 추천 카드 2~3개

카카오 공유: Kakao.Share.sendDefault (feed)
  - imageUrl: 유형별 OG 이미지 (https:// 절대경로)
  - buttons: [{ title: '나도 테스트하기' }]
  
generateMetadata: 유형별 고유 OG 태그
  - title: "나는 [유형명]! | [테스트제목] - TestiFi"
  - og:image: 유형별 이미지
```

### → Gemini: UI 다듬기

```
Claude가 만든 컴포넌트들의 UI를 다듬어줘. gemini.md 수칙을 따라.

대상:
  src/components/test/QuestionStep.tsx
  src/components/test/ResultCard.tsx
  src/components/test/ShareButtons.tsx
  src/components/test/ProgressBar.tsx

개선:
1. QuestionStep: 질문 전환 fade+translateY 애니메이션 (Tailwind transition)
2. ResultCard: 결과 공개 시 scale 애니메이션. Earthy 그라데이션 배경.
3. ShareButtons: 카카오 #FEE500, 나머지는 Earthy 팔레트. 카카오가 가장 크게.
4. ProgressBar: 올리브(#9B9B5A) → 살몬(#C4967A) 그라데이션
5. 모든 터치 타겟 44x44px 이상
6. dvh로 뷰포트 대응

주의: props/로직 변경 금지. 스타일링만.
```

---

## Phase 3: AI 자동생성

### → Claude Code

```
AI 자동 테스트 생성 시스템을 만들어줘.

파일:
  src/app/api/generate-test/route.ts
  src/lib/claude.ts
  scripts/auto-generate.ts

기능:
1. Claude Sonnet API로 새 테스트 JSON 생성
2. 프롬프트 컨텍스트: 현재 날짜/계절 + 기존 테스트 목록(중복 방지) + gemini.md의 황금 공식
3. Supabase에 published_at=null로 저장 (수동 검수 후 공개)
4. Vercel Cron: 월/수/금 오전 9시 (KST)

관리자(src/app/admin/page.tsx):
  - 미공개 테스트 목록 (shadcn Card)
  - 공개/삭제 버튼 (shadcn Button)
  - 테스트별 통계 표시
  - ADMIN_PASSWORD 환경변수로 간단 인증

vercel.json:
  { "crons": [{ "path": "/api/generate-test", "schedule": "0 0 * * 1,3,5" }] }
```

---

## 유틸 프롬프트

### → Claude: 버그 수정

```
[버그 내용]을 수정해줘. claude.md 수칙 따라.
1. 원인 한 줄 분석
2. 수정 코드만 (전체 파일 출력 금지)
3. 영향받는 다른 파일 있으면 알려줘
```

### → Gemini: 새 테스트

```
새 심리테스트를 만들어줘.
주제: [주제]
타겟: [타겟]
시즌: [시즌]
gemini.md 황금 공식과 JSON 스키마 따라서. 질문 6개, 결과 6개.
```

### → Claude: 성능 점검

```
성능 점검해줘.
1. 번들 사이즈 (next build)
2. 불필요한 'use client'
3. next/image 사용 여부
4. 서버에서 가능한 페칭이 클라이언트에서 되고 있진 않은지
5. shadcn 미사용 컴포넌트 정리
```
