import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "영업 일일 보고 시스템",
  description: "영업 사원의 일일 보고서 작성 및 관리 시스템",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
