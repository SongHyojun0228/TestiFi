/** 테스트 전체 데이터 */
export interface TestiFiTest {
  id: string;
  slug: string;
  title: string;
  description: string;
  ogImage: string;
  questions: Question[];
  results: ResultType[];
  createdAt: string;
  publishedAt: string | null;
  viewCount: number;
  shareCount: number;
  completionCount: number;
}

/** 질문 항목 */
export interface Question {
  id: number;
  text: string;
  emoji?: string;
  options: Option[];
}

/** 선택지 */
export interface Option {
  id: string;
  text: string;
  scores: Record<string, number>;
}

/** 결과 유형 */
export interface ResultType {
  id: string;
  slug: string;
  title: string;
  emoji: string;
  description: string;
  detailedAnalysis: string;
  compatibility: {
    best: string;
    worst: string;
  };
  ogImage: string;
  shareText: string;
}

/** DB 행 → 앱 타입 변환용 (Supabase snake_case → camelCase) */
export interface TestRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  og_image: string;
  questions: Question[];
  results: ResultType[];
  created_at: string;
  published_at: string | null;
  view_count: number;
  share_count: number;
  completion_count: number;
}

/** 분석 이벤트 */
export interface AnalyticsEvent {
  id: string;
  testSlug: string;
  eventType: string;
  resultType: string | null;
  referrer: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** 프리미엄 결제 */
export interface PremiumPurchase {
  id: string;
  testSlug: string;
  resultType: string;
  paymentId: string;
  amount: number;
  createdAt: string;
}

/** TestRow → TestiFiTest 변환 */
export function toTestiFiTest(row: TestRow): TestiFiTest {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    ogImage: row.og_image,
    questions: row.questions,
    results: row.results,
    createdAt: row.created_at,
    publishedAt: row.published_at,
    viewCount: row.view_count,
    shareCount: row.share_count,
    completionCount: row.completion_count,
  };
}
