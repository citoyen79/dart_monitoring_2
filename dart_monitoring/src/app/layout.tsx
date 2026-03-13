import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Activity } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DART 스마트 알림 시스템",
  description: "한국 신용평가 실무자를 위한 맞춤형 DART 공시 모니터링",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col`} >
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight hover:text-blue-400 transition-colors">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>DART Monitor</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
              <Link href="/companies" className="hover:text-white transition-colors">기업 관리</Link>
              <Link href="/keywords" className="hover:text-white transition-colors">제외 키워드</Link>
              <Link href="/notifications" className="hover:text-white transition-colors">알림 내역</Link>
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
