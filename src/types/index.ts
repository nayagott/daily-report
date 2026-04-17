import type { Role } from "@prisma/client"

/** JWT 페이로드 (access token) */
export interface JWTPayload {
  userId: number
  role: Role
  iat?: number
  exp?: number
}

/** JWT 페이로드 (refresh token) */
export interface RefreshJWTPayload {
  userId: number
  iat?: number
  exp?: number
}

/** 미들웨어·API Route에서 사용하는 세션 정보 */
export interface Session {
  userId: number
  role: Role
}

/** 공통 페이지네이션 응답 */
export interface Pagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

/** 공통 API 성공 응답 */
export interface ApiResponse<T> {
  success: true
  data: T
}

/** 공통 API 목록 응답 */
export interface ApiListResponse<T> {
  success: true
  data: T[]
  pagination: Pagination
}

/** 공통 API 실패 응답 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
}
