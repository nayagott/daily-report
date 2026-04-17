import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { server } from "../../mocks/server"
import LoginPage from "@/app/(auth)/login/page"

// next/navigation mock
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe("LoginPage UI (SCR-001)", () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it("TC-AUTH-001: 로그인 성공 → /reports 이동", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json({
          success: true,
          data: {
            access_token: "mock-access",
            refresh_token: "mock-refresh",
            user: { user_id: 1, name: "홍길동", email: "sales1@test.com", role: "SALES", department: "영업1팀" },
          },
        }),
      ),
    )

    render(<LoginPage />)

    await userEvent.type(screen.getByLabelText("이메일"), "sales1@test.com")
    await userEvent.type(screen.getByLabelText("비밀번호"), "password1234")
    await userEvent.click(screen.getByRole("button", { name: "로그인" }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/reports"))
  })

  it("TC-AUTH-002: 잘못된 비밀번호 → 에러 메시지", async () => {
    server.use(
      http.post("/api/auth/login", () =>
        HttpResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "이메일 또는 비밀번호가 올바르지 않습니다." } },
          { status: 401 },
        ),
      ),
    )

    render(<LoginPage />)

    await userEvent.type(screen.getByLabelText("이메일"), "sales1@test.com")
    await userEvent.type(screen.getByLabelText("비밀번호"), "wrong")
    await userEvent.click(screen.getByRole("button", { name: "로그인" }))

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("이메일 또는 비밀번호가 올바르지 않습니다."),
    )
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("TC-AUTH-004: 이메일 누락 → 필드 유효성 오류", async () => {
    render(<LoginPage />)

    await userEvent.click(screen.getByRole("button", { name: "로그인" }))

    await waitFor(() => {
      expect(screen.getByText(/올바른 이메일 형식이 아닙니다/)).toBeInTheDocument()
    })
  })

  it("TC-AUTH-004: 비밀번호 누락 → 필드 유효성 오류", async () => {
    render(<LoginPage />)

    await userEvent.type(screen.getByLabelText("이메일"), "sales1@test.com")
    await userEvent.click(screen.getByRole("button", { name: "로그인" }))

    await waitFor(() => {
      expect(screen.getByText(/비밀번호를 입력해 주세요/)).toBeInTheDocument()
    })
  })
})
