import { z } from "zod"

export const createUserSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  department: z.string().optional(),
  role: z.enum(["SALES", "MANAGER"], {
    error: "역할은 SALES 또는 MANAGER이어야 합니다.",
  }),
})

export const updateUserSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  department: z.string().optional(),
  role: z.enum(["SALES", "MANAGER"], {
    error: "역할은 SALES 또는 MANAGER이어야 합니다.",
  }),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
