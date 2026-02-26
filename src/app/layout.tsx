import type { Metadata } from "next";
import localFont from "next/font/local";
import KakaoScript from "@/components/providers/KakaoScript";
import Analytics from "@/components/providers/Analytics";
import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: {
    default: "TestiFi | 너를 알아가는 가장 가벼운 방법",
    template: "%s | TestiFi",
  },
  description:
    "AI가 만든 심리테스트로 나를 발견하고, 친구와 공유하세요. 매주 새로운 테스트가 업데이트됩니다.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://testifi.kr"
  ),
  openGraph: {
    siteName: "TestiFi",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-[family-name:var(--font-pretendard)] antialiased">
        {children}
        <KakaoScript />
        <Analytics />
      </body>
    </html>
  );
}
