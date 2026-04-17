// @vitest-environment node
import { describe, it, expect, vi } from "vitest"
import { NextRequest } from "next/server"
import { ApiError } from "@/lib/api-response"

// env 모듈을 mock하여 테스트 환경에서 환경변수 검증을 우회한다
vi.mock("@/lib/env", () => ({
  env: {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    JWT_SECRET: "test-secret-key-that-is-at-least-32-chars!!",
    JWT_ACCESS_EXPIRES: "2h",
    JWT_REFRESH_EXPIRES: "7d",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NODE_ENV: "test",
  },
}))

// mock 설정 후 auth 모듈을 import한다
const { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } =
  await import("@/lib/auth/jwt")
const { getSession } = await import("@/lib/auth/session")
const { requireRole } = await import("@/lib/auth/guard")

// ─────────────────────────────────────────────────────────────
// jwt.ts
// ─────────────────────────────────────────────────────────────

describe("signAccessToken / verifyAccessToken", () => {
  it("SALES 역할 토큰을 생성하고 검증한다", async () => {
    const token = await signAccessToken({ userId: 1, role: "SALES" })
    expect(typeof token).toBe("string")
    expect(token.split(".").length).toBe(3) // JWT 구조

    const payload = await verifyAccessToken(token)
    expect(payload.userId).toBe(1)
    expect(payload.role).toBe("SALES")
  })

  it("MANAGER 역할 토큰을 생성하고 검증한다", async () => {
    const token = await signAccessToken({ userId: 2, role: "MANAGER" })
    const payload = await verifyAccessToken(token)
    expect(payload.userId).toBe(2)
    expect(payload.role).toBe("MANAGER")
  })

  it("변조된 토큰은 검증에 실패한다", async () => {
    await expect(verifyAccessToken("invalid.token.here")).rejects.toThrow()
  })
})

describe("signRefreshToken / verifyRefreshToken", () => {
  it("Refresh Token을 생성하고 검증한다", async () => {
    const token = await signRefreshToken({ userId: 1 })
    expect(typeof token).toBe("string")

    const payload = await verifyRefreshToken(token)
    expect(payload.userId).toBe(1)
  })

  it("변조된 Refresh Token은 검증에 실패한다", async () => {
    await expect(verifyRefreshToken("bad.token")).rejects.toThrow()
  })
})

// ─────────────────────────────────────────────────────────────
// session.ts
// ─────────────────────────────────────────────────────────────

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/reports", {
    headers: new Headers({ ...headers }),
  })
}

describe("getSession()", () => {
  it("x-user-id, x-user-role 헤더로 세션을 반환한다", () => {
    const req = makeRequest({ "x-user-id": "1", "x-user-role": "SALES" })
    const session = getSession(req)
    expect(session.userId).toBe(1)
    expect(session.role).toBe("SALES")
  })

  it("헤더가 없으면 401 ApiError를 throw한다", () => {
    const req = makeRequest()
    expect(() => getSession(req)).toThrow(ApiError)
    try {
      getSession(req)
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(401)
      expect((err as ApiError).code).toBe("UNAUTHORIZED")
    }
  })

  it("x-user-id가 숫자가 아니면 401 ApiError를 throw한다", () => {
    const req = makeRequest({ "x-user-id": "abc", "x-user-role": "SALES" })
    expect(() => getSession(req)).toThrow(ApiError)
    try {
      getSession(req)
    } catch (err) {
      expect((err as ApiError).status).toBe(401)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// guard.ts
// ─────────────────────────────────────────────────────────────

describe("requireRole()", () => {
  it("역할이 일치하면 통과한다", () => {
    expect(() => requireRole("SALES", { userId: 1, role: "SALES" })).not.toThrow()
  })

  it("배열로 복수 역할을 허용할 수 있다", () => {
    expect(() => requireRole(["SALES", "MANAGER"], { userId: 1, role: "MANAGER" })).not.toThrow()
  })

  it("역할이 다르면 403 ApiError를 throw한다", () => {
    expect(() => requireRole("MANAGER", { userId: 1, role: "SALES" })).toThrow(ApiError)
    try {
      requireRole("MANAGER", { userId: 1, role: "SALES" })
    } catch (err) {
      expect((err as ApiError).status).toBe(403)
      expect((err as ApiError).code).toBe("FORBIDDEN")
    }
  })

  it("배열 내 모든 역할에 해당하지 않으면 403 throw한다", () => {
    expect(() => requireRole(["MANAGER"], { userId: 1, role: "SALES" })).toThrow(ApiError)
  })
})
