import { z } from "zod"

const visitSchema = z.object({
  customer_id: z.number().int().positive("고객을 선택해 주세요."),
  content: z.string().min(1, "방문 내용을 입력해 주세요."),
  visit_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "방문 시간은 HH:MM 형식으로 입력해 주세요.")
    .optional(),
})

const problemSchema = z.object({
  content: z.string().min(1, "과제/상담 내용을 입력해 주세요."),
})

const planSchema = z.object({
  content: z.string().min(1, "내일 할 일 내용을 입력해 주세요."),
})

export const createReportSchema = z.object({
  report_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)"),
  visits: z
    .array(visitSchema)
    .min(1, "방문 기록을 1건 이상 입력해 주세요."),
  problems: z.array(problemSchema).optional(),
  plans: z.array(planSchema).optional(),
})

export const updateReportSchema = createReportSchema

export type CreateReportInput = z.infer<typeof createReportSchema>
export type UpdateReportInput = z.infer<typeof updateReportSchema>
