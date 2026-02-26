import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import type { TestRow } from "@/types/test";
import { toTestiFiTest } from "@/types/test";
import TestClient from "@/components/test/TestClient";

interface Props {
  params: { slug: string };
}

/** 서버에서 테스트 데이터 조회 */
async function getTest(slug: string) {
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from("tests")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .single<TestRow>();

  return data ? toTestiFiTest(data) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const test = await getTest(params.slug);
  if (!test) return { title: "테스트를 찾을 수 없습니다" };

  return {
    title: test.title,
    description: test.description,
    openGraph: {
      title: test.title,
      description: test.description,
      images: test.ogImage ? [{ url: test.ogImage, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function TestPage({ params }: Props) {
  const test = await getTest(params.slug);
  if (!test) notFound();

  return <TestClient test={test} />;
}
