"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Download } from "lucide-react";
import { shareToKakao } from "@/lib/kakao";
import { trackShare } from "@/lib/analytics";
import type { ResultType } from "@/types/test";

interface ShareButtonsProps {
  result: ResultType;
  testSlug: string;
  testTitle: string;
  siteUrl: string;
}

/** 공유 버튼 그룹 — 카카오 / 링크복사 / X / 인스타(이미지 저장) */
export default function ShareButtons({
  result,
  testSlug,
  testTitle,
  siteUrl,
}: ShareButtonsProps) {
  const shareUrl = `${siteUrl}/test/${testSlug}/result/${result.slug}`;
  const testUrl = `${siteUrl}/test/${testSlug}`;
  const ogImageUrl = result.ogImage
    ? result.ogImage
    : `${siteUrl}/og/${testSlug}-${result.slug}.png`;

  const handleKakao = useCallback(() => {
    trackShare(testSlug, result.slug, "kakao");
    shareToKakao({
      title: `나는 ${result.title}!`,
      description: result.shareText,
      imageUrl: ogImageUrl,
      shareUrl,
      testUrl,
    });
  }, [result, testSlug, ogImageUrl, shareUrl, testUrl]);

  const handleCopyLink = useCallback(async () => {
    trackShare(testSlug, result.slug, "link_copy");
    await navigator.clipboard.writeText(shareUrl);
    alert("링크가 복사되었어요!");
  }, [testSlug, result.slug, shareUrl]);

  const handleTwitter = useCallback(() => {
    trackShare(testSlug, result.slug, "twitter");
    const text = encodeURIComponent(
      `${result.shareText}\n\n${testTitle}`
    );
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [result, testSlug, testTitle, shareUrl]);

  const handleInstagramSave = useCallback(async () => {
    trackShare(testSlug, result.slug, "instagram_save");
    try {
      const response = await fetch(ogImageUrl);
      if (!response.ok) throw new Error("이미지 없음");

      const blob = await response.blob();
      // blob이 유효한 이미지인지 확인
      if (!blob.type.startsWith("image/")) throw new Error("이미지가 아님");

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `testifi-${result.slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      alert("아직 결과 이미지가 준비되지 않았어요. 곧 업데이트됩니다!");
    }
  }, [testSlug, result.slug, ogImageUrl]);

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-center text-sm font-medium text-muted-foreground">
        친구들은 무슨 유형일까? 🌿
      </p>

      {/* 카카오톡 — 가장 크고 눈에 띄게 */}
      <Button
        onClick={handleKakao}
        className="min-h-[44px] h-12 w-full text-base font-semibold"
        style={{ backgroundColor: "#FEE500", color: "#191919" }}
      >
        <KakaoIcon />
        카카오톡으로 공유하기
      </Button>

      {/* 나머지 공유 버튼 */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="min-h-[44px] h-auto gap-1.5 text-sm whitespace-normal"
          onClick={handleCopyLink}
        >
          <Link2 className="h-4 w-4" />
          링크 복사
        </Button>
        <Button
          variant="outline"
          className="min-h-[44px] h-auto gap-1.5 text-sm whitespace-normal"
          onClick={handleTwitter}
        >
          <XIcon />
          X 공유
        </Button>
        <Button
          variant="outline"
          className="min-h-[44px] h-auto gap-1.5 text-sm whitespace-normal"
          onClick={handleInstagramSave}
        >
          <Download className="h-4 w-4" />
          이미지 저장
        </Button>
      </div>
    </div>
  );
}

/** 카카오 로고 SVG */
function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1C4.58 1 1 3.87 1 7.39c0 2.27 1.49 4.26 3.74 5.4l-.96 3.53c-.08.31.27.56.54.38l4.2-2.78c.16.01.32.02.48.02 4.42 0 8-2.87 8-6.55C17 3.87 13.42 1 9 1z"
        fill="#191919"
      />
    </svg>
  );
}

/** X(트위터) 로고 SVG */
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
