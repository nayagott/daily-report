import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Cloud Run 배포를 위한 standalone 출력
  // .next/standalone 에 self-contained 서버 번들 생성
  output: "standalone",
}

export default nextConfig
