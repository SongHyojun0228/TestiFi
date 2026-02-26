import { createSupabaseServer } from "@/lib/supabase/server";
import type { TestRow } from "@/types/test";
import TestCard from "@/components/TestCard";
import { Separator } from "@/components/ui/separator";

/** 매 요청마다 최신 데이터 렌더링 */
export const dynamic = "force-dynamic";

/** 발행된 테스트 목록 조회 (최신순) */
async function getPublishedTests() {
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from("tests")
    .select("slug, title, description, questions, completion_count, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  return (data ?? []) as Pick<
    TestRow,
    "slug" | "title" | "description" | "questions" | "completion_count" | "published_at"
  >[];
}

/** 발행일 기준 7일 이내인지 */
function isNew(publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  const diff = Date.now() - new Date(publishedAt).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

/** 첫 번째 질문의 이모지 추출 (없으면 기본값) */
function getTestEmoji(questions: TestRow["questions"]): string {
  if (Array.isArray(questions) && questions.length > 0 && questions[0].emoji) {
    return questions[0].emoji;
  }
  return "🧪";
}

export default async function Home() {
  const tests = await getPublishedTests();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8">
      {/* 헤더 */}
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">
          TestiFi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          너를 알아가는 가장 가벼운 방법
        </p>
      </header>

      <Separator className="mb-6" />

      {/* 테스트 목록 */}
      {tests.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            인기 테스트
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tests.map((test) => (
              <TestCard
                key={test.slug}
                slug={test.slug}
                title={test.title}
                description={test.description}
                emoji={getTestEmoji(test.questions)}
                completionCount={test.completion_count}
                isNew={isNew(test.published_at)}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <span className="text-4xl">🌿</span>
          <p className="text-sm text-muted-foreground">
            아직 준비된 테스트가 없어요.
          </p>
          <p className="text-xs text-muted-foreground">
            곧 재미있는 테스트가 올라올 거예요!
          </p>
        </div>
      )}

      {/* 푸터 */}
      <footer className="mt-auto pt-8 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 TestiFi. 테스티피.
        </p>
      </footer>
    </main>
  );
}
