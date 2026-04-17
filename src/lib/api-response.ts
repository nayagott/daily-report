import { NextResponse } from "next/server"
import { type ZodError } from "zod"

/** API 명세서 §3.1 공통 성공 응답 */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status })
}

/** API 명세서 §3.1 — 201 Created */
export function created<T>(data: T): NextResponse {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

/** API 명세서 §3.1 공통 실패 응답 */
export function apiError(
  status: number,
  code: string,
  message: string,
  details?: Array<{ field: string; message: string }>,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  )
}

/** Zod 유효성 오류를 공통 에러 응답으로 변환 */
export function validationError(error: ZodError): NextResponse {
  const details = error.issues.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }))
  return apiError(400, "VALIDATION_ERROR", "입력값이 올바르지 않습니다.", details)
}

/** 커스텀 API 에러 클래스 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }

  toResponse(): NextResponse {
    return apiError(this.status, this.code, this.message)
  }
}
