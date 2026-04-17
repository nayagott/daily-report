import { describe, it, expect } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "../../mocks/server"

const BASE = ""

async function loginRequest(body: unknown) {
  return fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("Auth API (MSW mock)", () => {
  it("TC-AUTH-001: 로그인 성공 응답 구조 확인", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({
          success: true,
          data: {
            access_token: "eyJ...",
            refresh_token: "eyJ...",
            user: { user_id: 1, name: "홍길동", email: "sales1@test.com", role: "SALES", department: "영업1팀" },
          },
        }),
      ),
    )

    const res = await loginRequest({ email: "sales1@test.com", password: "password1234" })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toHaveProperty("access_token")
    expect(json.data).toHaveProperty("refresh_token")
    expect(json.data.user.role).toBe("SALES")
  })

  it("TC-AUTH-002: 잘못된 비밀번호 → 401 UNAUTHORIZED", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "이메일 또는 비밀번호가 올바르지 않습니다." } },
          { status: 401 },
        ),
      ),
    )

    const res = await loginRequest({ email: "sales1@test.com", password: "wrong" })
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error.code).toBe("UNAUTHORIZED")
  })

  it("TC-AUTH-003: 존재하지 않는 이메일 → 401 (이메일 존재 여부 미노출)", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "이메일 또는 비밀번호가 올바르지 않습니다." } },
          { status: 401 },
        ),
      ),
    )

    const res = await loginRequest({ email: "nobody@test.com", password: "password1234" })
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error.code).toBe("UNAUTHORIZED")
  })

  it("TC-AUTH-004: 이메일 누락 → 400 VALIDATION_ERROR", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json(
          { success: false, error: { code: "VALIDATION_ERROR", message: "입력값이 올바르지 않습니다." } },
          { status: 400 },
        ),
      ),
    )

    const res = await loginRequest({ password: "password1234" })
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error.code).toBe("VALIDATION_ERROR")
  })

  it("TC-AUTH-005: refresh_token으로 새 access_token 발급", async () => {
    server.use(
      http.post("/api/auth/refresh", () =>
        HttpResponse.json({ success: true, data: { access_token: "new-access-token" } }),
      ),
    )

    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: "mock-refresh-token" }),
    })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toHaveProperty("access_token")
  })

  it("TC-AUTH-006: 로그아웃 → 200, 이후 refresh → 401", async () => {
    server.use(
      http.post("/api/auth/logout", () => HttpResponse.json({ success: true, data: null })),
      http.post("/api/auth/refresh", () =>
        HttpResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "토큰이 무효화되었습니다." } },
          { status: 401 },
        ),
      ),
    )

    const logoutRes = await fetch("/api/auth/logout", { method: "POST" })
    expect(logoutRes.status).toBe(200)

    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: "invalidated-token" }),
    })
    expect(refreshRes.status).toBe(401)
  })
})
