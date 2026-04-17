import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/lib/schemas/auth"
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt"
import { apiError, validationError } from "@/lib/api-response"
import prisma from "@/lib/db/prisma"

const ACCESS_TOKEN_MAX_AGE = 2 * 60 * 60 // 2시간
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7일

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError(400, "VALIDATION_ERROR", "요청 본문이 올바르지 않습니다.")
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return validationError(parsed.error)
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return apiError(401, "UNAUTHORIZED", "이메일 또는 비밀번호가 올바르지 않습니다.")
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return apiError(401, "UNAUTHORIZED", "이메일 또는 비밀번호가 올바르지 않습니다.")
  }

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ userId: user.userId, role: user.role }),
    signRefreshToken({ userId: user.userId }),
  ])

  await prisma.user.update({
    where: { userId: user.userId },
    data: { refreshToken },
  })

  const response = NextResponse.json(
    {
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          user_id: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department ?? null,
        },
      },
    },
    { status: 200 },
  )

  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  })

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: "/",
  })

  return response
}
