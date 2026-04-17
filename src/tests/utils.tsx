import { type ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"

/**
 * 전역 Provider(Context, Router 등)를 래핑한 커스텀 render
 *
 * 앱에 Context / Provider 가 추가될 때 이 파일에서 함께 래핑합니다.
 *
 * @example
 * import { renderWithProviders } from "@/tests/utils"
 *
 * it("renders report list", () => {
 *   renderWithProviders(<ReportList />)
 *   expect(screen.getByText("보고서 목록")).toBeInTheDocument()
 * })
 */
function Providers({ children }: { children: React.ReactNode }) {
  // TODO: 인증 Context, Query Client 등 추가
  return <>{children}</>
}

function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: Providers, ...options })
}

// @testing-library/react 의 모든 export 를 re-export
export * from "@testing-library/react"
export { renderWithProviders }
