import { describe, it, expect } from "vitest"
import { z } from "zod"

/** env.ts를 직접 import하면 module 캐시 때문에 환경변수 변경이 반영되지 않으므로
 *  내부 스키마와 동일한 로직을 직접 테스트한다. */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().min(1),
  JWT_REFRESH_EXPIRES: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
})

const VALID_ENV = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
  JWT_SECRET: "super-secret-key-that-is-at-least-32-chars!!",
  JWT_ACCESS_EXPIRES: "2h",
  JWT_REFRESH_EXPIRES: "7d",
  NODE_ENV: "test",
}

describe("환경변수 스키마 검증", () => {
  it("유효한 환경변수를 통과시킨다", () => {
    const result = envSchema.safeParse(VALID_ENV)
    expect(result.success).toBe(true)
  })

  it("NEXT_PUBLIC_APP_URL 기본값이 적용된다", () => {
    const result = envSchema.safeParse(VALID_ENV)
    if (!result.success) throw new Error("should pass")
    expect(result.data.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000")
  })

  it("NEXT_PUBLIC_APP_URL이 있으면 사용된다", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      NEXT_PUBLIC_APP_URL: "https://example.com",
    })
    if (!result.success) throw new Error("should pass")
    expect(result.data.NEXT_PUBLIC_APP_URL).toBe("https://example.com")
  })

  it("DATABASE_URL이 없으면 실패한다", () => {
    const { DATABASE_URL: _, ...rest } = VALID_ENV
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it("JWT_SECRET이 32자 미만이면 실패한다", () => {
    const result = envSchema.safeParse({ ...VALID_ENV, JWT_SECRET: "short" })
    expect(result.success).toBe(false)
    if (!result.success) {
      const secretIssue = result.error.issues.find((i) => i.path.includes("JWT_SECRET"))
      expect(secretIssue).toBeDefined()
    }
  })

  it("JWT_ACCESS_EXPIRES가 없으면 실패한다", () => {
    const { JWT_ACCESS_EXPIRES: _, ...rest } = VALID_ENV
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it("JWT_REFRESH_EXPIRES가 없으면 실패한다", () => {
    const { JWT_REFRESH_EXPIRES: _, ...rest } = VALID_ENV
    const result = envSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it("NEXT_PUBLIC_APP_URL이 URL 형식이 아니면 실패한다", () => {
    const result = envSchema.safeParse({
      ...VALID_ENV,
      NEXT_PUBLIC_APP_URL: "not-a-url",
    })
    expect(result.success).toBe(false)
  })

  it("NODE_ENV가 유효하지 않은 값이면 실패한다", () => {
    const result = envSchema.safeParse({ ...VALID_ENV, NODE_ENV: "staging" })
    expect(result.success).toBe(false)
  })
})
