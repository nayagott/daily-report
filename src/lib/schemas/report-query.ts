import { z } from "zod"

/** GET /reports 쿼리 파라미터 검증 스키마 */
export const reportListQuerySchema = z.object({
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)")
    .optional(),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)")
    .optional(),
  user_id: z
    .string()
    .regex(/^\d+$/, "user_id는 정수여야 합니다.")
    .transform((v) => parseInt(v, 10))
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, "page는 정수여야 합니다.")
    .transform((v) => parseInt(v, 10))
    .optional()
    .transform((v) => v ?? 1),
  per_page: z
    .string()
    .regex(/^\d+$/, "per_page는 정수여야 합니다.")
    .transform((v) => parseInt(v, 10))
    .optional()
    .transform((v) => v ?? 20),
})

export type ReportListQuery = z.infer<typeof reportListQuerySchema>
