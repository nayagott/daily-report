/** API 응답 데이터 타입 — API 명세서 §5~§8 기반 */

/** 사용자 요약 (보고서·댓글 내 임베드용) */
export interface UserSummary {
  user_id: number
  name: string
  department?: string
}

/** 고객 요약 (방문 기록 내 임베드용) */
export interface CustomerSummary {
  customer_id: number
  company_name: string
  contact_name?: string
}

/** 방문 기록 */
export interface VisitRecord {
  visit_id: number
  customer: CustomerSummary
  content: string
  visit_time?: string
}

/** 댓글 */
export interface Comment {
  comment_id: number
  content: string
  author: UserSummary
  created_at: string
}

/** Problem */
export interface Problem {
  problem_id: number
  content: string
  comments: Comment[]
  created_at: string
}

/** Plan */
export interface Plan {
  plan_id: number
  content: string
  comments: Comment[]
  created_at: string
}

/** 보고서 목록 아이템 */
export interface ReportListItem {
  report_id: number
  report_date: string
  user: UserSummary
  visit_count: number
  created_at: string
  updated_at: string
}

/** 보고서 상세 */
export interface ReportDetail {
  report_id: number
  report_date: string
  user: UserSummary
  visits: VisitRecord[]
  problems: Problem[]
  plans: Plan[]
  created_at: string
  updated_at: string
}

/** 고객 */
export interface Customer {
  customer_id: number
  company_name: string
  contact_name?: string
  phone?: string
  address?: string
  industry?: string
  created_at: string
}

/** 사용자 */
export interface User {
  user_id: number
  name: string
  email: string
  department?: string
  role: "SALES" | "MANAGER"
  created_at: string
}

/** 로그인 응답 */
export interface AuthTokens {
  access_token: string
  refresh_token: string
  user: Pick<User, "user_id" | "name" | "email" | "role" | "department">
}
