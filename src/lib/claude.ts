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

/** 응답 텍스트에서 JSON 추출 */
function extractJson(text: string): string {
  let str = text.trim();

  /* 코드블록 제거 */
  const codeBlock = str.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlock) {
    str = codeBlock[1].trim();
  }

  /* 첫 { 부터 마지막 } 까지 추출 */
  const firstBrace = str.indexOf("{");
  const lastBrace = str.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    str = str.slice(firstBrace, lastBrace + 1);
  }

  return str;
}

/** Claude Sonnet API로 새 심리테스트 JSON 생성 (실패 시 1회 재시도) */
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

  const systemPrompt = `너는 바이럴 심리테스트 JSON 생성기야.
반드시 유효한 JSON만 출력해. 마크다운, 코드블록, 설명 텍스트 절대 금지.
JSON 문자열 안의 큰따옴표는 반드시 \\"로 이스케이프해.
줄바꿈은 JSON 문자열 안에 넣지 마.`;

  const userPrompt = `새로운 심리테스트 JSON을 만들어줘.

## 오늘: ${today} / 시즌: ${season}
## 상시 인기 주제: 돈/연봉, 연애/궁합, MBTI 변형, 직장생활, 음식, 카페

## 기존 테스트 (중복 금지)
${existingSlugs.length > 0 ? existingSlugs.join(", ") : "없음"}

## 규칙
- 제목: "나의 _____ 유형은?" 패턴
- 질문 6개, 선택지 3개씩 (일상 상황 시나리오, 직접 성격 질문 금지)
- 결과 유형 6개 (유머+공감, 이모지 포함)
- 결과 톤: 긍정 80% + 찔림 20%
- description 150~200자, detailedAnalysis 400~500자
- shareText 30자 내외
- slug: 영문 kebab-case
- 질문 id: 숫자 1~6
- 선택지 id: "q{번호}_{a|b|c}"
- 유형 id: "type_a"~"type_f"
- scores: 높은 점수(3) 하나 + 낮은 점수(1) 하나
- compatibility best/worst: 다른 유형 id

## JSON 구조
{"slug":"","title":"","description":"","questions":[{"id":1,"text":"","emoji":"","options":[{"id":"q1_a","text":"","scores":{"type_a":3,"type_b":1}}]}],"results":[{"id":"type_a","slug":"","title":"","emoji":"","description":"","detailedAnalysis":"","compatibility":{"best":"type_b","worst":"type_c"},"shareText":""}]}`;

  /* 최대 2회 시도 */
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      lastError = new Error("Claude API 응답에서 텍스트를 찾을 수 없습니다");
      continue;
    }

    try {
      const jsonStr = extractJson(textBlock.text);
      const parsed = JSON.parse(jsonStr) as GeneratedTest;

      /* 기본 유효성 검사 */
      if (!parsed.slug || !parsed.title || !parsed.questions || !parsed.results) {
        throw new Error("필수 필드 누락");
      }
      if (parsed.questions.length < 5 || parsed.questions.length > 10) {
        throw new Error(`질문 수 범위 밖: ${parsed.questions.length}개`);
      }
      if (parsed.results.length < 4 || parsed.results.length > 8) {
        throw new Error(`결과 유형 수 범위 밖: ${parsed.results.length}개`);
      }

      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("테스트 생성 실패");
}
