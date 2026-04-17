import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

describe("Button 컴포넌트", () => {
  it("텍스트가 렌더링된다", () => {
    render(<Button>저장</Button>)
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument()
  })

  it("disabled 상태가 적용된다", () => {
    render(<Button disabled>저장</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("variant prop이 전달된다", () => {
    render(<Button variant="destructive">삭제</Button>)
    const button = screen.getByRole("button", { name: "삭제" })
    expect(button).toBeInTheDocument()
  })

  it("onClick 핸들러가 호출된다", () => {
    let clicked = false
    render(
      <Button
        onClick={() => {
          clicked = true
        }}
      >
        클릭
      </Button>,
    )
    screen.getByRole("button").click()
    expect(clicked).toBe(true)
  })
})

describe("Input 컴포넌트", () => {
  it("렌더링된다", () => {
    render(<Input placeholder="이메일 입력" />)
    expect(screen.getByPlaceholderText("이메일 입력")).toBeInTheDocument()
  })

  it("type prop이 적용된다", () => {
    render(<Input type="password" placeholder="비밀번호" />)
    const input = screen.getByPlaceholderText("비밀번호")
    expect(input).toHaveAttribute("type", "password")
  })

  it("disabled 상태가 적용된다", () => {
    render(<Input disabled placeholder="읽기 전용" />)
    expect(screen.getByPlaceholderText("읽기 전용")).toBeDisabled()
  })

  it("defaultValue가 표시된다", () => {
    render(<Input defaultValue="test@example.com" />)
    const input = screen.getByDisplayValue("test@example.com")
    expect(input).toBeInTheDocument()
  })
})
