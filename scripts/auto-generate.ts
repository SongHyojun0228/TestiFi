/**
 * CLI에서 수동으로 테스트 생성 실행
 * 사용법: pnpm tsx scripts/auto-generate.ts
 */
import "dotenv/config";

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    process.stderr.write("ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.\n");
    process.exit(1);
  }

  process.stdout.write("테스트 자동생성 시작...\n");

  const res = await fetch(`${baseUrl}/api/generate-test`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${password}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    process.stderr.write(`생성 실패: ${data.error}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `생성 완료! slug: ${data.test.slug}, title: ${data.test.title}\n`
  );
  process.stdout.write(
    "관리자 페이지에서 검수 후 공개하세요.\n"
  );
}

main();
