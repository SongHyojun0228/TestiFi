"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ResultType } from "@/types/test";

interface ResultCardProps {
  result: ResultType;
  testTitle: string;
  /** 궁합 유형 이름 (best / worst) */
  bestName: string;
  worstName: string;
}

/** 결과 카드 — 이모지 + 유형명 + 설명 + 궁합 */
export default function ResultCard({
  result,
  testTitle,
  bestName,
  worstName,
}: ResultCardProps) {
  return (
    <Card className="w-full border-0 shadow-lg animate-in zoom-in-95 fade-in duration-500 bg-gradient-to-br from-[#F5F0E8] to-[#FAF7F2]">
      <CardHeader className="items-center gap-3 pb-2">
        <Badge variant="secondary" className="text-xs">
          {testTitle}
        </Badge>
        <span className="text-6xl">{result.emoji}</span>
        <h1 className="text-center text-2xl font-bold">{result.title}</h1>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* 설명 */}
        <p className="text-center text-base leading-relaxed text-muted-foreground">
          {result.description}
        </p>

        <Separator />

        {/* 궁합 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-olive/10 p-3 text-center">
            <p className="mb-1 text-xs text-muted-foreground">최고 궁합</p>
            <p className="text-sm font-semibold text-primary">
              {bestName}
            </p>
          </div>
          <div className="rounded-lg bg-rose/10 p-3 text-center">
            <p className="mb-1 text-xs text-muted-foreground">최악 궁합</p>
            <p className="text-sm font-semibold text-accent">
              {worstName}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
