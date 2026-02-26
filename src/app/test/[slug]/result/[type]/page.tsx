import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { TestRow, TestiFiTest } from "@/types/test";
import { toTestiFiTest } from "@/types/test";
import ResultClient from "@/components/test/ResultClient";

interface Props {
  params: { slug: string; type: string };
}

/** 서버에서 테스트 데이터 조회 */
async function getTest(slug: string): Promise<TestiFiTest | null> {
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from("tests")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .single<TestRow>();

  return data ? toTestiFiTest(data) : null;
}

/** 추천 테스트 조회 (현재 테스트 제외, 최신 3개) */
async function getRecommended(excludeSlug: string) {
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from("tests")
    .select("slug, title, description")
    .not("published_at", "is", null)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(3);

  return data ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const test = await getTest(params.slug);
  if (!test) return { title: "결과를 찾을 수 없습니다" };

  const result = test.results.find((r) => r.slug === params.type);
  if (!result) return { title: "결과를 찾을 수 없습니다" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://testifi.kr";
  const ogImage = result.ogImage || `${siteUrl}/og/${test.slug}-${result.slug}.png`;

  return {
    title: `나는 ${result.title}! | ${test.title}`,
    description: result.shareText,
    openGraph: {
      title: `나는 ${result.title}!`,
      description: result.shareText,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const [test, recommended] = await Promise.all([
    getTest(params.slug),
    getRecommended(params.slug),
  ]);

  if (!test) notFound();

  const result = test.results.find((r) => r.slug === params.type);
  if (!result) notFound();

  return (
    <ResultClient
      test={test}
      result={result}
      recommended={recommended}
    />
  );
}
