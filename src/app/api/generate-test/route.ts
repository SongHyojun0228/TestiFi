import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateTest } from "@/lib/claude";

/** API Route용 Supabase 어드민 클라이언트 (쿠키 불필요) */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Vercel Cron 또는 수동 호출용 테스트 자동생성 API */
export async function POST(req: NextRequest) {
  /* Vercel Cron 인증 또는 ADMIN_PASSWORD 검증 */
  const authHeader = req.headers.get("authorization");
  const cronSecret = req.headers.get("x-vercel-cron");

  const isAuthorized =
    cronSecret !== null ||
    authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  try {
    const supabase = getAdminClient();

    /* 기존 테스트 slug 목록 조회 (중복 방지용) */
    const { data: existingTests } = await supabase
      .from("tests")
      .select("slug");

    const existingSlugs = (existingTests ?? []).map(
      (t: { slug: string }) => t.slug
    );

    /* Claude API로 새 테스트 생성 */
    const newTest = await generateTest(existingSlugs);

    /* Supabase에 저장 (published_at = null → 수동 검수 후 공개) */
    const { data, error } = await supabase
      .from("tests")
      .insert({
        slug: newTest.slug,
        title: newTest.title,
        description: newTest.description,
        og_image: "",
        questions: newTest.questions,
        results: newTest.results,
        published_at: null,
      })
      .select("id, slug, title")
      .single();

    if (error) {
      throw new Error(`Supabase 저장 실패: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      test: data,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/** Vercel Cron은 GET으로도 호출될 수 있음 */
export async function GET(req: NextRequest) {
  return POST(req);
}
