import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  test: {
    // 테스트 환경
    environment: "jsdom",

    // 각 테스트 파일 실행 전 자동으로 로드할 설정 파일
    setupFiles: ["./src/tests/setup.ts"],

    // 전역 API (describe, it, expect 등) import 없이 사용 가능
    globals: true,

    // 커버리지 설정
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/**",
        ".next/**",
        "src/tests/**",
        "**/*.config.*",
        "**/*.d.ts",
        "prisma/**",
      ],
      // 커버리지 임계값
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // 테스트 파일 위치
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e/**"],
  },
})
