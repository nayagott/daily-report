import { z } from "zod"

export const createCommentSchema = z.object({
  content: z.string().min(1, "댓글 내용을 입력해 주세요."),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
