/** 폼 입력 타입 — react-hook-form + Zod 스키마와 대응 */

/** SCR-001 로그인 폼 */
export interface LoginFormValues {
  email: string
  password: string
}

/** SCR-004 보고서 작성/편집 — 방문 기록 행 */
export interface VisitFormRow {
  customer_id: number
  content: string
  visit_time?: string
}

/** SCR-004 보고서 작성/편집 폼 */
export interface ReportFormValues {
  report_date: string
  visits: VisitFormRow[]
  problems: Array<{ content: string }>
  plans: Array<{ content: string }>
}

/** SCR-003 댓글 입력 폼 */
export interface CommentFormValues {
  content: string
}

/** SCR-006 고객 마스터 등록/편집 폼 */
export interface CustomerFormValues {
  company_name: string
  contact_name?: string
  phone?: string
  address?: string
  industry?: string
}

/** SCR-008 사용자 마스터 등록 폼 */
export interface UserCreateFormValues {
  name: string
  email: string
  password: string
  department?: string
  role: "SALES" | "MANAGER"
}

/** SCR-008 사용자 마스터 편집 폼 (이메일·비밀번호 제외) */
export interface UserEditFormValues {
  name: string
  department?: string
  role: "SALES" | "MANAGER"
}
