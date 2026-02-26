"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
}

/** 질문 진행률 표시 */
export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {current} / {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <Progress
        value={percentage}
        className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-[#9B9B5A] [&>div]:to-[#C4967A]"
      />
    </div>
  );
}
