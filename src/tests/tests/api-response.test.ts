import { describe, it, expect } from "vitest"
import { z } from "zod"
import { ok, created, apiError, validationError, ApiError } from "@/lib/api-response"

describe("ok()", () => {
  it("success: true와 data를 반환한다", async () => {
    const res = ok({ id: 1 })
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ id: 1 })
    expect(res.status).toBe(200)
  })

  it("커스텀 status를 반영한다", async () => {
    const res = ok(null, 202)
    expect(res.status).toBe(202)
  })
})

describe("created()", () => {
  it("201 상태코드와 data를 반환한다", async () => {
    const res = created({ report_id: 42 })
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ report_id: 42 })
  })
})

describe("apiError()", () => {
  it("success: false와 error 구조를 반환한다", async () => {
    const res = apiError(404, "NOT_FOUND", "리소스를 찾을 수 없습니다.")
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe("NOT_FOUND")
    expect(body.error.message).toBe("리소스를 찾을 수 없습니다.")
  })

  it("details가 있을 때 포함된다", async () => {
    const details = [{ field: "email", message: "이메일 형식이 잘못되었습니다." }]
    const res = apiError(400, "VALIDATION_ERROR", "입력 오류", details)
    const body = await res.json()
    expect(body.error.details).toEqual(details)
  })

  it("details가 없을 때 omit된다", async () => {
    const res = apiError(403, "FORBIDDEN", "권한이 없습니다.")
    const body = await res.json()
    expect(body.error.details).toBeUndefined()
  })
})

describe("validationError()", () => {
  it("Zod 오류를 400 VALIDATION_ERROR로 변환한다", async () => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(8) })
    const result = schema.safeParse({ email: "not-email", password: "short" })
    if (result.success) throw new Error("should fail")

    const res = validationError(result.error)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error.code).toBe("VALIDATION_ERROR")
    expect(Array.isArray(body.error.details)).toBe(true)
    expect(body.error.details.length).toBeGreaterThan(0)
    expect(body.error.details[0]).toHaveProperty("field")
    expect(body.error.details[0]).toHaveProperty("message")
  })
})

describe("ApiError 클래스", () => {
  it("toResponse()가 올바른 응답을 생성한다", async () => {
    const err = new ApiError(409, "CONFLICT", "이미 등록된 고객사명입니다.")
    const res = err.toResponse()
    const body = await res.json()
    expect(res.status).toBe(409)
    expect(body.error.code).toBe("CONFLICT")
    expect(body.error.message).toBe("이미 등록된 고객사명입니다.")
  })

  it("Error를 상속한다", () => {
    const err = new ApiError(500, "INTERNAL_ERROR", "서버 오류")
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe("ApiError")
    expect(err.message).toBe("서버 오류")
  })
})
