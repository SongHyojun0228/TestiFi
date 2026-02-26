import Anthropic from "@anthropic-ai/sdk";
import type { Question, ResultType } from "@/types/test";

/** Claude API로 생성된 테스트 원본 구조 */
interface GeneratedTest {
  slug: string;
  title: string;
  description: string;
  questions: Question[];
  results: ResultType[];
}

/** 현재 계절 키워드 반환 */
function getSeasonContext(): string {
  const month = new Date().getMonth() + 1;

  if (month >= 3 && month <= 5)
    return "봄 (벚꽃, 새학기, 입사, 소개팅, 다이어트)";
  if (month >= 6 && month <= 8)
    return "여름 (여행, 바캉스, 더위, 축제, 휴가)";
  if (month >= 9 && month <= 11)
    return "가을 (독서, 감성, 추석, 연말 준비, 이직)";
  return "겨울 (크리스마스, 연말결산, 새해계획, 겨울감성)";
}

/** Claude Sonnet API로 새 심리테스트 JSON 생성 */
export async function generateTest(
  existingSlugs: string[]
): Promise<GeneratedTest> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const season = getSeasonContext();
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `너는 바이럴 심리테스트 전문 콘텐츠 크리에이터야.
아래 규칙을 반드시 지켜서 새로운 심리테스트 JSON을 만들어줘.

## 오늘 날짜 & 시즌
- 날짜: ${today}
- 시즌: ${season}
- 상시 인기 주제: 돈/연봉, 연애/궁합, MBTI 변형, 직장생활, 음식, 카페

## 이미 존재하는 테스트 (중복 금지)
${existingSlugs.length > 0 ? existingSlugs.map((s) => `- ${s}`).join("\n") : "- 없음"}

## 바이럴 테스트 황금 공식
1. 제목: "나의 _____ 유형은?" 또는 "2026 나의 _____ 테스트" 패턴
2. 질문: 일상 상황 + 의외의 선택지. "당신은 ~한 편인가요?" 같은 직접 성격 질문 절대 금지.
3. 유형명: 유머 + 공감 + 공유욕구. 이모지 필수.
4. 결과 설명: "맞아 나 이런데!" 반응 유도. 긍정 80% + 약간의 찔림 20%.
5. 궁합: 구체적이고 재미있게.

## 필수 규칙
- 질문 6개, 선택지 3개씩
- 결과 유형 6개
- 자연스러운 한국어. 번역투 절대 금지.
- 결과 description 150~200자
- 결과 detailedAnalysis 400~500자
- shareText는 카카오 공유용 한줄 (30자 내외)
- slug는 영문 kebab-case
- 질문 id는 1부터 순서대로 숫자
- 선택지 id는 "q{질문번호}_{a|b|c}" 형식
- 결과 유형 id는 "type_a" ~ "type_f"
- scores에서 각 선택지는 높은 점수(3) 하나와 낮은 점수(1) 하나를 부여
- compatibility의 best/worst는 다른 유형의 id

## 출력 형식
순수 JSON만 출력. 마크다운 코드블록이나 설명 없이 JSON만.

{
  "slug": "영문-kebab-case",
  "title": "테스트 제목",
  "description": "한 줄 설명 30자 내외",
  "questions": [
    {
      "id": 1,
      "text": "질문 텍스트",
      "emoji": "🎯",
      "options": [
        { "id": "q1_a", "text": "선택지 텍스트", "scores": { "type_a": 3, "type_b": 1 } },
        { "id": "q1_b", "text": "선택지 텍스트", "scores": { "type_c": 3, "type_d": 1 } },
        { "id": "q1_c", "text": "선택지 텍스트", "scores": { "type_e": 3, "type_f": 1 } }
      ]
    }
  ],
  "results": [
    {
      "id": "type_a",
      "slug": "result-slug",
      "title": "유형 이름",
      "emoji": "🔥",
      "description": "무료 설명 150-200자",
      "detailedAnalysis": "프리미엄 상세분석 400-500자",
      "compatibility": { "best": "type_b", "worst": "type_c" },
      "shareText": "카카오 공유용 한줄"
    }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  /* 응답에서 텍스트 추출 */
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude API 응답에서 텍스트를 찾을 수 없습니다");
  }

  /* JSON 파싱 (코드블록 감싸져 있을 수도 있으므로 추출) */
  let jsonStr = textBlock.text.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr) as GeneratedTest;

  /* 기본 유효성 검사 */
  if (!parsed.slug || !parsed.title || !parsed.questions || !parsed.results) {
    throw new Error("생성된 테스트 JSON 구조가 올바르지 않습니다");
  }
  if (parsed.questions.length < 5 || parsed.questions.length > 10) {
    throw new Error(`질문 수가 범위 밖: ${parsed.questions.length}개`);
  }
  if (parsed.results.length < 4 || parsed.results.length > 8) {
    throw new Error(`결과 유형 수가 범위 밖: ${parsed.results.length}개`);
  }

  return parsed;
}
