import { SignJWT, jwtVerify } from "jose"
import type { Role } from "@prisma/client"
import { env } from "@/lib/env"
import type { JWTPayload, RefreshJWTPayload } from "@/types"

const secret = new TextEncoder().encode(env.JWT_SECRET)

/** Access Token 생성 */
export async function signAccessToken(payload: { userId: number; role: Role }): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES)
    .sign(secret)
}

/** Refresh Token 생성 */
export async function signRefreshToken(payload: { userId: number }): Promise<string> {
  return new SignJWT({ userId: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES)
    .sign(secret)
}

/** Access Token 검증 */
export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as JWTPayload
}

/** Refresh Token 검증 */
export async function verifyRefreshToken(token: string): Promise<RefreshJWTPayload> {
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as RefreshJWTPayload
}
