import type { Role } from "@prisma/client"
import type { Session } from "@/types"
import { ApiError } from "@/lib/api-response"

/**
 * 세션의 역할이 요구 역할과 일치하는지 검사한다.
 * 실패 시 ApiError(403, 'FORBIDDEN')을 throw한다.
 */
export function requireRole(role: Role | Role[], session: Session): void {
  const allowed = Array.isArray(role) ? role : [role]
  if (!allowed.includes(session.role)) {
    throw new ApiError(403, "FORBIDDEN", "접근 권한이 없습니다.")
  }
}
