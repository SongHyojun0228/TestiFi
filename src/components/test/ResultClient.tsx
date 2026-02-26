"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, ArrowRight } from "lucide-react";
import type { TestiFiTest, ResultType } from "@/types/test";
import ResultCard from "@/components/test/ResultCard";
import ShareButtons from "@/components/test/ShareButtons";
import { trackResultView } from "@/lib/analytics";

interface ResultClientProps {
  test: TestiFiTest;
  result: ResultType;
  /** 추천 테스트 목록 (현재 테스트 제외) */
  recommended: Pick<TestiFiTest, "slug" | "title" | "description">[];
}

/** 유형 ID로 해당 유형의 title 조회 */
function findTypeName(results: ResultType[], typeId: string): string {
  return results.find((r) => r.id === typeId)?.title ?? typeId;
}

/** 결과 페이지 클라이언트 */
export default function ResultClient({
  test,
  result,
  recommended,
}: ResultClientProps) {
  const [siteUrl, setSiteUrl] = useState("https://testifi.kr");

  useEffect(() => {
    // 브라우저에서 실제 origin 사용
    setSiteUrl(window.location.origin);
    trackResultView(test.slug, result.slug);
  }, [test.slug, result.slug]);

  const bestName = findTypeName(test.results, result.compatibility.best);
  const worstName = findTypeName(test.results, result.compatibility.worst);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 px-4 py-8">
      <Link href="/" className="text-lg font-bold text-primary hover:opacity-80">
        TestiFi
      </Link>

      {/* 1. 결과 카드 */}
      <ResultCard
        result={result}
        testTitle={test.title}
        bestName={bestName}
        worstName={worstName}
      />

      {/* 2. 공유 버튼 */}
      <ShareButtons
        result={result}
        testSlug={test.slug}
        testTitle={test.title}
        siteUrl={siteUrl}
      />

      <Separator />

      {/* 3. 프리미엄 상세분석 미리보기 */}
      <PremiumPreview result={result} />

      {/* 4. 애드센스 자리 (Phase 1 이후 교체) */}
      <div className="flex h-[100px] w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
        <span className="text-xs text-muted-foreground">AD</span>
      </div>

      {/* 5. 다른 테스트 추천 */}
      {recommended.length > 0 && (
        <section className="w-full space-y-3">
          <h3 className="text-center text-sm font-semibold text-muted-foreground">
            다른 테스트도 해볼래?
          </h3>
          {recommended.map((t) => (
            <Link key={t.slug} href={`/test/${t.slug}`} className="block">
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {/* 홈으로 */}
      <Link href="/" className="pb-4">
        <Button variant="ghost" className="text-sm text-muted-foreground">
          모든 테스트 보기
        </Button>
      </Link>
    </main>
  );
}

/** 프리미엄 상세분석 미리보기 Dialog */
function PremiumPreview({ result }: { result: ResultType }) {
  // 상세분석 텍스트의 앞부분만 보여주고 나머지 블러
  const previewText = result.detailedAnalysis.slice(0, 60);

  return (
    <div className="w-full space-y-3">
      <Card className="relative overflow-hidden border-accent/30 bg-accent/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">프리미엄 상세분석</h3>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {previewText}...
          </p>
          {/* 블러 오버레이 */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            더 자세한 분석이 궁금하다면?
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              프리미엄 상세분석
            </DialogTitle>
            <DialogDescription>
              나만을 위한 심층 분석 리포트
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {previewText}...
            </p>
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">
                전체 분석 보기
              </p>
              <p className="text-lg font-bold text-accent">1,900원</p>
            </div>
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled
            >
              결제하기 (준비 중)
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Toss Payments 연동 후 오픈 예정
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
