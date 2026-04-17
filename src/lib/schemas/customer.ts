import { z } from "zod"

export const createCustomerSchema = z.object({
  company_name: z.string().min(1, "고객사명을 입력해 주세요."),
  contact_name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
})

export const updateCustomerSchema = createCustomerSchema

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
