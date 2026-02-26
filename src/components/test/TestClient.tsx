"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TestiFiTest, Option } from "@/types/test";
import ProgressBar from "@/components/test/ProgressBar";
import QuestionStep from "@/components/test/QuestionStep";
import {
  trackTestStart,
  trackQuestionAnswer,
  trackTestComplete,
} from "@/lib/analytics";

interface TestClientProps {
  test: TestiFiTest;
}

/** 점수 합산 후 최고 점수 유형 slug 반환 (동점이면 먼저 나온 유형) */
function calculateResult(
  answers: Option[],
  test: TestiFiTest
): string {
  const scores: Record<string, number> = {};

  // 모든 유형을 0으로 초기화 (순서 보장)
  for (const result of test.results) {
    scores[result.id] = 0;
  }

  // 답변별 점수 누적
  for (const answer of answers) {
    for (const [typeId, score] of Object.entries(answer.scores)) {
      scores[typeId] = (scores[typeId] ?? 0) + score;
    }
  }

  // 최고 점수 유형 찾기 (동점이면 results 배열에서 먼저 나온 유형)
  let maxScore = -1;
  let resultSlug = test.results[0].slug;

  for (const result of test.results) {
    const score = scores[result.id] ?? 0;
    if (score > maxScore) {
      maxScore = score;
      resultSlug = result.slug;
    }
  }

  return resultSlug;
}

/** 테스트 진행 클라이언트 컴포넌트 */
export default function TestClient({ test }: TestClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  const totalQuestions = test.questions.length;
  const currentQuestion = test.questions[currentIndex];

  // 테스트 시작 이벤트
  useEffect(() => {
    trackTestStart(test.slug);
  }, [test.slug]);

  const handleBack = useCallback(() => {
    if (currentIndex <= 0) return;
    setIsVisible(false);
    setTimeout(() => {
      setAnswers((prev) => prev.slice(0, -1));
      setCurrentIndex((prev) => prev - 1);
      setIsVisible(true);
    }, 200);
  }, [currentIndex]);

  const handleAnswer = useCallback(
    (optionId: string) => {
      const option = currentQuestion.options.find((o) => o.id === optionId);
      if (!option) return;

      trackQuestionAnswer(test.slug, currentQuestion.id, optionId);

      const newAnswers = [...answers, option];
      setAnswers(newAnswers);

      // 마지막 질문이면 결과 계산 후 리다이렉트
      if (currentIndex >= totalQuestions - 1) {
        const resultSlug = calculateResult(newAnswers, test);
        trackTestComplete(test.slug, resultSlug);
        router.push(`/test/${test.slug}/result/${resultSlug}`);
        return;
      }

      // fade out → 다음 질문 → fade in
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsVisible(true);
      }, 200);
    },
    [answers, currentIndex, currentQuestion, test, totalQuestions, router]
  );

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center gap-6 px-4 py-8">
      <Link href="/" className="text-lg font-bold text-primary hover:opacity-80">
        TestiFi
      </Link>

      <h2 className="text-center text-xl font-bold">
        {test.title}
      </h2>

      <div className="flex w-full items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        </div>
      </div>

      <div
        className={`w-full transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        <QuestionStep
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      </div>
    </main>
  );
}
