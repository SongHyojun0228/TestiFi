"use client";

interface ShareParams {
  title: string;
  description: string;
  imageUrl: string;
  shareUrl: string;
  testUrl: string;
}

/** 카카오톡 피드 공유 — Kakao.Share.sendDefault */
export function shareToKakao({
  title,
  description,
  imageUrl,
  shareUrl,
  testUrl,
}: ShareParams) {
  if (typeof window === "undefined" || !window.Kakao?.Share) return;

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl,
      link: {
        mobileWebUrl: shareUrl,
        webUrl: shareUrl,
      },
    },
    buttons: [
      {
        title: "내 결과 보기",
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      {
        title: "나도 테스트하기",
        link: {
          mobileWebUrl: testUrl,
          webUrl: testUrl,
        },
      },
    ],
  });
}
