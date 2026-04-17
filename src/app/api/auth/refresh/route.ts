import { type NextRequest } from "next/server"
import { refreshTokenSchema } from "@/lib/schemas/auth"
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt"
import { ok, apiError, validationError } from "@/lib/api-response"
import prisma from "@/lib/db/prisma"

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError(400, "VALIDATION_ERROR", "요청 본문이 올바르지 않습니다.")
  }

  const parsed = refreshTokenSchema.safeParse(body)
  if (!parsed.success) {
    return validationError(parsed.error)
  }

  const { refresh_token } = parsed.data

  let payload: { userId: number }
  try {
    payload = await verifyRefreshToken(refresh_token)
  } catch {
    return apiError(401, "UNAUTHORIZED", "토큰이 유효하지 않거나 만료되었습니다.")
  }

  const user = await prisma.user.findUnique({ where: { userId: payload.userId } })
  if (!user || user.refreshToken !== refresh_token) {
    return apiError(401, "UNAUTHORIZED", "토큰이 유효하지 않거나 만료되었습니다.")
  }

  const accessToken = await signAccessToken({ userId: user.userId, role: user.role })

  return ok({ access_token: accessToken })
}
