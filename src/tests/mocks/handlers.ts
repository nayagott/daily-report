import { http, HttpResponse } from "msw"

/**
 * 기본 MSW 핸들러 목록
 *
 * 각 테스트에서 server.use(...) 로 핸들러를 추가·덮어쓸 수 있습니다.
 *
 * @example
 * server.use(
 *   http.get("/api/v1/reports", () =>
 *     HttpResponse.json({ success: true, data: [] }),
 *   ),
 * )
 */
export const handlers = [
  // ── Auth ──────────────────────────────────────────────────────
  http.post("/api/v1/auth/login", () =>
    HttpResponse.json({
      success: true,
      data: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        user: {
          user_id: 1,
          name: "홍길동",
          email: "sales1@test.com",
          role: "SALES",
          department: "영업1팀",
        },
      },
    }),
  ),

  http.post("/api/v1/auth/logout", () =>
    HttpResponse.json({ success: true, data: null }),
  ),

  // ── Reports ───────────────────────────────────────────────────
  http.get("/api/v1/reports", () =>
    HttpResponse.json({
      success: true,
      data: [],
      pagination: { page: 1, per_page: 20, total: 0, total_pages: 0 },
    }),
  ),

  // ── Customers ─────────────────────────────────────────────────
  http.get("/api/v1/customers", () =>
    HttpResponse.json({
      success: true,
      data: [],
      pagination: { page: 1, per_page: 20, total: 0, total_pages: 0 },
    }),
  ),
]
