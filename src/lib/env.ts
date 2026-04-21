import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL은 필수입니다."),
  JWT_SECRET: z.string().min(32, "JWT_SECRET은 32자 이상이어야 합니다."),
  JWT_ACCESS_EXPIRES: z.string().min(1, "JWT_ACCESS_EXPIRES는 필수입니다."),
  JWT_REFRESH_EXPIRES: z.string().min(1, "JWT_REFRESH_EXPIRES는 필수입니다."),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")
    throw new Error(`환경변수 검증 실패:\n${missing}`)
  }
  return result.data
}

export const env = validateEnv()
