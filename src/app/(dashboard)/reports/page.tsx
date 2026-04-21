import { Suspense } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ReportsSearchForm } from "@/components/reports/ReportsSearchForm"
import { ReportsTable } from "@/components/reports/ReportsTable"
import { ReportsPagination } from "@/components/reports/ReportsPagination"
import prisma from "@/lib/db/prisma"
import type { ReportListItem } from "@/types/api"
import type { Pagination } from "@/types"

interface SearchParams {
  date_from?: string
  date_to?: string
  user_id?: string
  page?: string
  per_page?: string
}

interface ReportsPageProps {
  searchParams: Promise<SearchParams>
}

async function getReportsData(
  userId: number,
  role: "SALES" | "MANAGER",
  params: SearchParams,
) {
  const page = Math.max(parseInt(params.page ?? "1", 10) || 1, 1)
  const perPage = Math.min(parseInt(params.per_page ?? "20", 10) || 20, 100)
  const skip = (page - 1) * perPage

  // 기본 날짜 범위: 오늘 기준 -30일 ~ 오늘
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const defaultFrom = new Date()
  defaultFrom.setDate(defaultFrom.getDate() - 30)
  defaultFrom.setHours(0, 0, 0, 0)

  const dateFrom = params.date_from ? new Date(params.date_from + "T00:00:00Z") : defaultFrom
  const dateTo = params.date_to ? new Date(params.date_to + "T23:59:59Z") : todayEnd

  // 권한별 user_id 필터
  const whereUserId: number | undefined =
    role === "SALES"
      ? userId
      : params.user_id
        ? parseInt(params.user_id, 10)
        : undefined

  const where = {
    reportDate: { gte: dateFrom, lte: dateTo },
    ...(whereUserId !== undefined ? { userId: whereUserId } : {}),
  }

  const [total, reports] = await Promise.all([
    prisma.dailyReport.count({ where }),
    prisma.dailyReport.findMany({
      where,
      orderBy: { reportDate: "desc" },
      skip,
      take: perPage,
      select: {
        reportId: true,
        reportDate: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { userId: true, name: true, department: true },
        },
        _count: { select: { visitRecords: true } },
      },
    }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const data: ReportListItem[] = reports.map((r) => ({
    report_id: r.reportId,
    report_date: r.reportDate.toISOString().split("T")[0],
    user: {
      user_id: r.user.userId,
      name: r.user.name,
      ...(r.user.department !== null ? { department: r.user.department } : {}),
    },
    visit_count: r._count.visitRecords,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  }))

  const pagination: Pagination = { page, per_page: perPage, total, total_pages: totalPages }

  return { data, pagination }
}

async function getSalesUsers() {
  const users = await prisma.user.findMany({
    where: { role: "SALES" },
    select: { userId: true, name: true, department: true },
    orderBy: { name: "asc" },
  })
  return users.map((u) => ({
    user_id: u.userId,
    name: u.name,
    department: u.department ?? undefined,
  }))
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  // 미들웨어가 주입한 헤더에서 세션 정보 추출
  const headersList = await headers()
  const rawUserId = headersList.get("x-user-id")
  const rawRole = headersList.get("x-user-role")

  if (!rawUserId || !rawRole) {
    redirect("/login")
  }

  const sessionUserId = parseInt(rawUserId, 10)
  const sessionRole = rawRole as "SALES" | "MANAGER"

  const params = await searchParams

  const [{ data: reports, pagination }, salesUsers] = await Promise.all([
    getReportsData(sessionUserId, sessionRole, params),
    sessionRole === "MANAGER" ? getSalesUsers() : Promise.resolve([]),
  ])

  const isManager = sessionRole === "MANAGER"

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">보고서 목록</h1>
        {!isManager && (
          <Button asChild>
            <Link href="/reports/new">+ 보고서 작성</Link>
          </Button>
        )}
      </div>

      {/* 검색 조건 */}
      <Suspense fallback={null}>
        <ReportsSearchForm isManager={isManager} users={salesUsers} />
      </Suspense>

      {/* 보고서 목록 테이블 */}
      <ReportsTable
        reports={reports}
        page={pagination.page}
        perPage={pagination.per_page}
      />

      {/* 페이지네이션 */}
      <Suspense fallback={null}>
        <ReportsPagination page={pagination.page} totalPages={pagination.total_pages} />
      </Suspense>
    </div>
  )
}
