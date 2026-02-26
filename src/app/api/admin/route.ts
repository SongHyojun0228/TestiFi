import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** API Route용 Supabase 어드민 클라이언트 (쿠키 불필요) */
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** ADMIN_PASSWORD 검증 헬퍼 */
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
}

/** GET: 전체 테스트 목록 조회 */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("tests")
    .select(
      "id, slug, title, description, published_at, created_at, view_count, share_count, completion_count, questions, results"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ tests: data });
}

/** PATCH: 테스트 공개 (published_at 설정) */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const body = await req.json();
  const { action, id } = body as { action: string; id: string };

  if (action !== "publish" || !id) {
    return NextResponse.json(
      { error: "잘못된 요청" },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("tests")
    .update({ published_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

/** DELETE: 테스트 삭제 */
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body as { id: string };

  if (!id) {
    return NextResponse.json(
      { error: "id가 필요합니다" },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();
  const { error } = await supabase.from("tests").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
