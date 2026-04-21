import type { NextRequest } from "next/server"
import type { Role } from "@prisma/client"
import type { Session } from "@/types"
import { ApiError } from "@/lib/api-response"

/**
 * API Route 핸들러 내부에서 현재 사용자 정보를 가져오는 헬퍼.
 * middleware.ts가 x-user-id / x-user-role 헤더를 주입한 뒤 호출해야 한다.
 */
export function getSession(request: NextRequest): Session {
  const userId = request.headers.get("x-user-id")
  const role = request.headers.get("x-user-role")

  if (!userId || !role) {
    throw new ApiError(401, "UNAUTHORIZED", "인증이 필요합니다.")
  }

  const parsedId = parseInt(userId, 10)
  if (isNaN(parsedId)) {
    throw new ApiError(401, "UNAUTHORIZED", "인증 정보가 올바르지 않습니다.")
  }

  return { userId: parsedId, role: role as Role }
}
