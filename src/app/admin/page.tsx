"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Trash2,
  Plus,
  LogIn,
  CheckCircle,
  BarChart3,
} from "lucide-react";

/** 관리자용 테스트 요약 */
interface AdminTest {
  id: string;
  slug: string;
  title: string;
  description: string;
  published_at: string | null;
  created_at: string;
  view_count: number;
  share_count: number;
  completion_count: number;
  questions: { id: number }[];
  results: { id: string; title: string }[];
}

/** 관리자 대시보드 */
export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [tests, setTests] = useState<AdminTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  /** 테스트 목록 불러오기 */
  const fetchTests = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("목록 조회 실패");
      const data = await res.json();
      setTests(data.tests);
    } catch {
      setMessage("테스트 목록을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  /** 로그인 */
  const handleLogin = useCallback(async () => {
    const res = await fetch("/api/admin", {
      headers: { Authorization: `Bearer ${password}` },
    });
    if (res.ok) {
      setToken(password);
      setMessage("");
      fetchTests(password);
    } else {
      setMessage("비밀번호가 틀립니다.");
    }
  }, [password, fetchTests]);

  /** 테스트 공개 */
  const handlePublish = useCallback(
    async (id: string) => {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "publish", id }),
      });
      if (res.ok) {
        setMessage("공개 완료!");
        fetchTests(token);
      } else {
        setMessage("공개 실패");
      }
    },
    [token, fetchTests]
  );

  /** 테스트 삭제 */
  const handleDelete = useCallback(
    async (id: string, title: string) => {
      if (!confirm(`"${title}" 테스트를 정말 삭제하시겠습니까?`)) return;
      const res = await fetch("/api/admin", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMessage("삭제 완료!");
        fetchTests(token);
      } else {
        setMessage("삭제 실패");
      }
    },
    [token, fetchTests]
  );

  /** AI 테스트 생성 */
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setMessage("AI가 새 테스트를 생성 중...");
    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`생성 완료: ${data.test.title}`);
        fetchTests(token);
      } else {
        setMessage(`생성 실패: ${data.error}`);
      }
    } catch {
      setMessage("생성 중 오류 발생");
    } finally {
      setGenerating(false);
    }
  }, [token, fetchTests]);

  /** 토큰이 있으면 자동으로 목록 조회 */
  useEffect(() => {
    if (token) fetchTests(token);
  }, [token, fetchTests]);

  /* 로그인 전 */
  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold">TestiFi 관리자</h1>
        <input
          type="password"
          placeholder="관리자 비밀번호"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <Button onClick={handleLogin} className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          로그인
        </Button>
        {message && (
          <p className="text-sm text-destructive">{message}</p>
        )}
      </main>
    );
  }

  /* 미공개 / 공개 테스트 분리 */
  const unpublished = tests.filter((t) => !t.published_at);
  const published = tests.filter((t) => t.published_at);

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">TestiFi 관리자</h1>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          {generating ? "생성 중..." : "AI 테스트 생성"}
        </Button>
      </div>

      {message && (
        <p className="rounded-lg bg-muted px-4 py-2 text-sm">{message}</p>
      )}

      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="전체 테스트"
          value={tests.length}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="공개"
          value={published.length}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatCard
          label="미공개"
          value={unpublished.length}
          icon={<Eye className="h-4 w-4" />}
        />
      </div>

      <Separator />

      {/* 미공개 테스트 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-muted-foreground">
          검수 대기 ({unpublished.length})
        </h2>
        {loading && <p className="text-sm text-muted-foreground">로딩 중...</p>}
        {unpublished.map((t) => (
          <TestAdminCard
            key={t.id}
            test={t}
            onPublish={() => handlePublish(t.id)}
            onDelete={() => handleDelete(t.id, t.title)}
          />
        ))}
        {!loading && unpublished.length === 0 && (
          <p className="text-sm text-muted-foreground">
            검수 대기 중인 테스트가 없습니다.
          </p>
        )}
      </section>

      <Separator />

      {/* 공개 테스트 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-muted-foreground">
          공개 중 ({published.length})
        </h2>
        {published.map((t) => (
          <TestAdminCard
            key={t.id}
            test={t}
            onDelete={() => handleDelete(t.id, t.title)}
          />
        ))}
      </section>
    </main>
  );
}

/** 통계 카드 */
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 p-4">
        {icon}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/** 관리자용 테스트 카드 */
function TestAdminCard({
  test,
  onPublish,
  onDelete,
}: {
  test: AdminTest;
  onPublish?: () => void;
  onDelete: () => void;
}) {
  const createdDate = new Date(test.created_at).toLocaleDateString("ko-KR");

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-semibold">{test.title}</p>
            <p className="text-xs text-muted-foreground">
              {test.description}
            </p>
          </div>
          <Badge variant={test.published_at ? "default" : "secondary"}>
            {test.published_at ? "공개" : "미공개"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 메타 정보 */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>slug: {test.slug}</span>
          <span>·</span>
          <span>질문 {test.questions.length}개</span>
          <span>·</span>
          <span>유형 {test.results.length}개</span>
          <span>·</span>
          <span>생성일: {createdDate}</span>
        </div>

        {/* 통계 */}
        {test.published_at && (
          <div className="flex gap-4 text-xs">
            <span>👁️ {test.view_count}</span>
            <span>🔗 {test.share_count}</span>
            <span>✅ {test.completion_count}</span>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          {onPublish && (
            <Button size="sm" onClick={onPublish}>
              <CheckCircle className="mr-1 h-3 w-3" />
              공개
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
