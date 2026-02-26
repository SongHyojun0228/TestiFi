"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types/test";
import { cn } from "@/lib/utils";

interface QuestionStepProps {
  question: Question;
  onAnswer: (optionId: string) => void;
}

/** 질문 1개 + 선택지 표시 */
export default function QuestionStep({
  question,
  onAnswer,
}: QuestionStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleSelect(optionId: string) {
    if (selectedId) return;
    setSelectedId(optionId);

    // 선택 피드백 후 다음 질문으로 전환
    setTimeout(() => {
      onAnswer(optionId);
      setSelectedId(null);
    }, 400);
  }

  return (
    <Card className="w-full border-0 shadow-soft animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
      <CardHeader className="items-center gap-2 pb-4">
        {question.emoji && (
          <span className="text-4xl">{question.emoji}</span>
        )}
        <h2 className="text-center text-lg font-semibold leading-relaxed">
          {question.text}
        </h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((option) => (
          <Button
            key={option.id}
            variant={selectedId === option.id ? "default" : "outline"}
            className={cn(
              "min-h-[44px] h-auto w-full whitespace-normal px-4 py-3 text-left text-base leading-relaxed transition-all duration-200",
              !selectedId && "hover:-translate-y-[2px] hover:shadow-md",
              selectedId && selectedId !== option.id && "opacity-50",
              selectedId === option.id && "scale-[0.98] ring-2 ring-[#9B9B5A] ring-offset-1"
            )}
            onClick={() => handleSelect(option.id)}
            disabled={selectedId !== null}
          >
            {option.text}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
