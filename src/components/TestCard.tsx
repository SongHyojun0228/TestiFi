import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface TestCardProps {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  completionCount?: number;
  isNew?: boolean;
}

/** 테스트 목록 카드 — 모바일 가로형 / 데스크탑 세로형 */
export default function TestCard({
  slug,
  title,
  description,
  emoji,
  completionCount = 0,
  isNew = false,
}: TestCardProps) {
  return (
    <Link href={`/test/${slug}`} className="block">
      <Card className="group h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4 md:flex-col md:items-start md:gap-3 md:p-5">
          {/* 이모지 */}
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl md:h-14 md:w-14 md:text-3xl">
            {emoji}
          </span>

          {/* 텍스트 */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold md:text-base md:whitespace-normal md:line-clamp-2">
                {title}
              </h3>
              {isNew && (
                <Badge className="shrink-0 px-1.5 py-0 text-[10px]">
                  NEW
                </Badge>
              )}
            </div>
            <p className="line-clamp-1 text-xs text-muted-foreground md:line-clamp-2">
              {description}
            </p>
            {completionCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{completionCount.toLocaleString()}명 참여</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
