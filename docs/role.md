# 역할 분담 (Claude Code × Gemini)

> 역할은 명확하게 분리. 겹치는 영역에서는 Claude 결정이 우선.

## 역할 총괄표

| 영역 | Claude (Opus 4.6) | Gemini (3.1 Pro) |
|------|-------------------|-----------------|
| 아키텍처 설계 | ✅ 주도 | ❌ |
| 핵심 비즈니스 로직 | ✅ 주도 | 🔶 리뷰 |
| API 개발 | ✅ 주도 | 🔶 에러핸들링 보강 |
| DB 스키마 | ✅ 주도 | ❌ |
| shadcn 테마 설정 | ✅ 주도 | 🔶 색상 미세조정 |
| 카카오 SDK 연동 | ✅ 주도 | 🔶 테스트/디버깅 |
| 결제 연동 | ✅ 주도 | ❌ |
| 심리테스트 콘텐츠 | 🔶 스키마 정의 | ✅ 주도 |
| UI 디자인 다듬기 | 🔶 뼈대 | ✅ 디자인 완성 |
| 애니메이션 | ❌ | ✅ 주도 |
| OG 이미지 디자인 | 🔶 생성 로직 | ✅ 디자인 |
| SEO/메타데이터 | ✅ 주도 | 🔶 보완 |
| QA (크로스브라우저) | 🔶 | ✅ 주도 |
| 성능 최적화 | ✅ 주도 | 🔶 |
| 배포/인프라 | ✅ 주도 | ❌ |

✅ 주도 / 🔶 보조 / ❌ 관여 안 함

---

## Claude 담당 파일

```
src/app/**                      # 모든 라우트 페이지
src/app/api/**                  # 모든 API
src/lib/**                      # 모든 유틸/라이브러리
src/types/**                    # 타입 정의
src/components/ui/**            # shadcn 컴포넌트 초기 세팅
supabase/**                     # DB 마이그레이션
scripts/**                      # 자동화
next.config.js / tailwind.config.ts / vercel.json
src/styles/globals.css          # shadcn CSS 변수 (초기 설정)
```

## Gemini 담당 파일

```
src/components/test/**          # QuestionStep, ResultCard, ShareButtons, ProgressBar
src/components/layout/**        # Header, Footer
src/components/TestCard.tsx     # 테스트 목록 카드
src/components/AdBanner.tsx     # 광고 UI
src/data/seed-tests/**          # 시드 테스트 콘텐츠
public/result-images/**         # 결과 이미지
```

---

## 개발 워크플로우

### Phase 1: MVP (Day 1-7)

```
Day 1-2:
  Claude → 프로젝트 세팅 (Next.js + shadcn + Supabase + Earthy 테마)
  Gemini → 시드 테스트 5개 콘텐츠 작성

Day 3-4:
  Claude → 테스트 진행 로직 + 결과 매칭 API + 라우팅
  Gemini → QuestionStep, ResultCard 디자인 다듬기

Day 5:
  Claude → 카카오톡 공유 + OG 이미지 동적 생성
  Gemini → 카카오 인앱브라우저 QA + 공유 미리보기 확인

Day 6:
  Claude → 애드센스 삽입 + 관리자 페이지
  Gemini → 전체 모바일 UX 점검 + 애니메이션

Day 7:
  Claude → Vercel 배포 + 도메인 + 카카오 도메인 등록
  Gemini → 최종 QA + 콘텐츠 검수
```

---

## 갈등 해결

```
기술적 의사결정 → Claude
콘텐츠 의사결정 → Gemini
디자인 의사결정 → Gemini (Claude 거부권)
성능 vs 디자인 충돌 → 성능 우선 (Claude)
둘 다 불확실 → 효준에게 질문
```
