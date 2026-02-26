/**
 * 시드 데이터를 Supabase tests 테이블에 삽입하는 스크립트
 * 실행: npx tsx scripts/seed.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("환경변수가 설정되지 않았습니다. .env.local을 확인하세요.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  const seedDir = join(__dirname, "../src/data/seed-tests");
  const files = readdirSync(seedDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(`시드 파일 ${files.length}개 발견`);

  for (const file of files) {
    const raw = readFileSync(join(seedDir, file), "utf-8");
    const data = JSON.parse(raw);

    const row = {
      slug: data.slug,
      title: data.title,
      description: data.description,
      og_image: data.ogImage ?? "",
      questions: data.questions,
      results: data.results,
      published_at: new Date().toISOString(),
    };

    // upsert — slug 기준으로 이미 있으면 업데이트
    const { error } = await supabase
      .from("tests")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`실패: ${file} — ${error.message}`);
    } else {
      console.log(`완료: ${data.title} (${data.slug})`);
    }
  }

  console.log("시딩 완료!");
}

seed();
