# 🍃 TestiFi (테스티피)

> AI가 트렌드를 읽고, 사람들이 공유하고 싶은 심리테스트를 자동으로 만드는 바이럴 플랫폼

## 프로젝트 개요

TestiFi는 AI 기반 심리테스트 자동 생성 + 카카오톡 바이럴 최적화 + 광고/프리미엄 수익화를 하나로 묶은 플랫폼이다. 사회복무 기간(3/5~) 동안에도 자동으로 콘텐츠가 생성되고, 바이럴이 돌고, 수익이 발생하는 구조를 목표로 한다.

### 핵심 컨셉

```
"테스트를 만드는 건 AI, 퍼뜨리는 건 사람"
```

- 사용자는 5~8개 질문에 답하고, 자기 유형을 발견하고, 카카오톡으로 공유한다
- AI(Claude API)가 시즌/트렌드에 맞는 새 테스트를 주 3회 자동 생성한다
- 개발자는 최소 관여로 운영한다

### 브랜드

- **이름**: TestiFi (테스티피)
- **컬러**: Earthy Tones (올리브 #a3a380–크림 #efebce –살몬 #d8a48f –로즈 #bb8588)
- **UI**: shadcn/ui + 커스텀 Earthy 테마
- **톤**: 친근하고 자연스러운, 가르치지 않는, 공유하고 싶은

### 비즈니스 모델

| 수익원 | 모델 | 예상 단가 | 단계 |
|--------|------|-----------|------|
| 구글 애드센스 | 결과 페이지 광고 | RPM $2-5 | Phase 1 |
| 프리미엄 상세분석 | 단건 결제 | 1,900~3,900원 | Phase 1 |
| 기업 브랜디드 테스트 | B2B 의뢰 | 50~200만원/건 | Phase 2 |
| 테스트 제작 SaaS | 월 구독 | 월 29,000~99,000원 | Phase 3 |

### 프로젝트 구조

```
testifi/
├── docs/
│   ├── README.md              # 이 파일
│   ├── claude.md              # Claude Code 수칙
│   ├── gemini.md              # Gemini 수칙
│   ├── role.md                # AI별 역할
│   ├── prompt.md              # AI별 프롬프트
│   ├── brand.md               # 브랜드 가이드
│   ├── marketing.md           # 마케팅 전략
│   └── tool.md                # 기술 스택
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 루트 레이아웃 (카카오SDK, GA, 폰트, shadcn)
│   │   ├── page.tsx           # 랜딩 (테스트 목록)
│   │   ├── test/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx   # 테스트 진행
│   │   │       └── result/
│   │   │           └── [type]/
│   │   │               └── page.tsx  # 결과 (공유+광고)
│   │   ├── admin/
│   │   │   └── page.tsx       # 관리자 대시보드
│   │   └── api/
│   │       ├── generate-test/ # AI 테스트 자동생성
│   │       ├── test/          # 테스트 데이터 CRUD
│   │       └── analytics/     # 통계
│   ├── components/
│   │   ├── ui/                # shadcn 컴포넌트 (Button, Card, Progress 등)
│   │   ├── test/
│   │   │   ├── QuestionStep.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   ├── ShareButtons.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── TestCard.tsx
│   │   └── AdBanner.tsx
│   ├── lib/
│   │   ├── kakao.ts           # 카카오 SDK 유틸
│   │   ├── claude.ts          # Claude API (테스트 생성)
│   │   ├── analytics.ts       # GA4 이벤트
│   │   ├── og-image.ts        # OG 이미지 생성
│   │   ├── supabase/
│   │   │   ├── client.ts      # 브라우저 클라이언트
│   │   │   └── server.ts      # 서버 클라이언트
│   │   ├── utils.ts           # cn() 등 유틸
│   │   └── constants.ts       # 상수
│   ├── types/
│   │   ├── test.ts            # 테스트 타입
│   │   └── supabase.ts        # DB 타입 (자동생성)
│   └── styles/
│       └── globals.css        # Tailwind + shadcn CSS 변수
├── public/
│   ├── og/                    # OG 이미지
│   └── fonts/                 # Pretendard woff2
├── supabase/
│   └── migrations/            # DB 스키마
├── scripts/
│   └── auto-generate.ts       # 크론잡 스크립트
├── components.json            # shadcn 설정
├── tailwind.config.ts
├── next.config.js
└── vercel.json
```

### 핵심 사용자 흐름

```
[카카오톡에서 링크 클릭] → [테스트 시작] → [5~8개 질문]
                                                ↓
                                        [결과 확인 + 궁합]
                                                ↓
                               ┌────────────────┼────────────────┐
                               ↓                ↓                ↓
                        [카카오톡 공유]    [프리미엄 결제]    [다른 테스트]
                               ↓
                        [친구가 클릭] → [반복] ← 바이럴 루프
```

### 타임라인

| 기간 | 목표 |
|------|------|
| D-7 (2/26~3/4) | MVP 완성 + 첫 테스트 3개 + 카카오 공유 + 배포 |
| Week 1-2 | 시딩 + 일 500 UV 달성 + 애드센스 신청 |
| Week 3-4 | 애드센스 승인 + 프리미엄 분석 결제 연동 |
| Month 2-3 | AI 자동생성 파이프라인 + 주 3개 자동 배포 |
| Month 4+ | 사회복무 중 자동운영 (월 1~2회 모니터링) |

### 성공 지표

| 지표 | 1개월 목표 | 3개월 목표 |
|------|-----------|-----------|
| 일 UV | 500 | 5,000 |
| 테스트 완료율 | 70%+ | 75%+ |
| 카카오 공유율 | 15%+ | 20%+ |
| K-factor | 0.3 | 0.8+ |
| 월 수익 | 10만원+ | 100만원+ |
