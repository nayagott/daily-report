import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해 주세요."),
})

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "refresh_token이 필요합니다."),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
