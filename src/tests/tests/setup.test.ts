import { describe, it, expect } from "vitest"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { loginSchema } from "@/lib/schemas/auth"
import { createReportSchema } from "@/lib/schemas/report"
import { createCommentSchema } from "@/lib/schemas/comment"
import { createCustomerSchema } from "@/lib/schemas/customer"
import { createUserSchema } from "@/lib/schemas/user"

describe("프로젝트 기반 환경 구성 검증", () => {
  describe("Tailwind 유틸리티 (cn)", () => {
    it("클래스 병합이 정상 동작한다", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
    })

    it("조건부 클래스가 정상 동작한다", () => {
      expect(cn("base", false && "not-included", "included")).toBe(
        "base included",
      )
    })
  })

  describe("Zod 스키마 — auth", () => {
    it("올바른 로그인 입력을 통과시킨다", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      })
      expect(result.success).toBe(true)
    })

    it("이메일 형식이 잘못되면 실패한다", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      })
      expect(result.success).toBe(false)
    })

    it("비밀번호가 없으면 실패한다", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("Zod 스키마 — report", () => {
    it("올바른 보고서 입력을 통과시킨다", () => {
      const result = createReportSchema.safeParse({
        report_date: "2026-04-13",
        visits: [{ customer_id: 1, content: "방문 내용" }],
      })
      expect(result.success).toBe(true)
    })

    it("방문 기록이 없으면 실패한다", () => {
      const result = createReportSchema.safeParse({
        report_date: "2026-04-13",
        visits: [],
      })
      expect(result.success).toBe(false)
    })

    it("날짜 형식이 잘못되면 실패한다", () => {
      const result = createReportSchema.safeParse({
        report_date: "2026/04/13",
        visits: [{ customer_id: 1, content: "방문 내용" }],
      })
      expect(result.success).toBe(false)
    })

    it("방문 시간이 올바른 형식이면 통과한다", () => {
      const result = createReportSchema.safeParse({
        report_date: "2026-04-13",
        visits: [{ customer_id: 1, content: "방문 내용", visit_time: "10:30" }],
      })
      expect(result.success).toBe(true)
    })

    it("방문 시간 형식이 잘못되면 실패한다", () => {
      const result = createReportSchema.safeParse({
        report_date: "2026-04-13",
        visits: [{ customer_id: 1, content: "방문 내용", visit_time: "1030" }],
      })
      expect(result.success).toBe(false)
    })
  })

  describe("Zod 스키마 — comment", () => {
    it("댓글 내용이 있으면 통과한다", () => {
      const result = createCommentSchema.safeParse({ content: "확인 요청" })
      expect(result.success).toBe(true)
    })

    it("댓글 내용이 비어있으면 실패한다", () => {
      const result = createCommentSchema.safeParse({ content: "" })
      expect(result.success).toBe(false)
    })
  })

  describe("Zod 스키마 — customer", () => {
    it("고객사명이 있으면 통과한다", () => {
      const result = createCustomerSchema.safeParse({
        company_name: "(주)테스트전자",
      })
      expect(result.success).toBe(true)
    })

    it("고객사명이 없으면 실패한다", () => {
      const result = createCustomerSchema.safeParse({ company_name: "" })
      expect(result.success).toBe(false)
    })
  })

  describe("Zod 스키마 — user", () => {
    it("올바른 사용자 입력을 통과시킨다", () => {
      const result = createUserSchema.safeParse({
        name: "홍길동",
        email: "hong@test.com",
        password: "password1234",
        role: "SALES",
      })
      expect(result.success).toBe(true)
    })

    it("비밀번호가 8자 미만이면 실패한다", () => {
      const result = createUserSchema.safeParse({
        name: "홍길동",
        email: "hong@test.com",
        password: "pass",
        role: "SALES",
      })
      expect(result.success).toBe(false)
    })

    it("잘못된 역할이면 실패한다", () => {
      const result = createUserSchema.safeParse({
        name: "홍길동",
        email: "hong@test.com",
        password: "password1234",
        role: "ADMIN",
      })
      expect(result.success).toBe(false)
    })

    it("MANAGER 역할을 통과시킨다", () => {
      const result = createUserSchema.safeParse({
        name: "이부장",
        email: "manager@test.com",
        password: "password1234",
        role: "MANAGER",
      })
      expect(result.success).toBe(true)
    })
  })

  describe("Zod v4 타입 확인", () => {
    it("ZodError.issues 속성이 존재한다", () => {
      const schema = z.string().min(1)
      const result = schema.safeParse("")
      if (!result.success) {
        expect(Array.isArray(result.error.issues)).toBe(true)
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })
})
