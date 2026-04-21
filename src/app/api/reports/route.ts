import { NextResponse, type NextRequest } from "next/server"
import { getSession } from "@/lib/auth/session"
import { validationError, apiError } from "@/lib/api-response"
import { ApiError } from "@/lib/api-response"
import { reportListQuerySchema } from "@/lib/schemas/report-query"
import prisma from "@/lib/db/prisma"

// GET /api/reports — 보고서 목록 조회
// 권한: SALES(본인), MANAGER(전체)
export async function GET(request: NextRequest) {
  try {
    // 1. 인증: 세션 추출 (미들웨어가 x-user-id / x-user-role 주입)
    const session = getSession(request)

    // 2. 쿼리 파라미터 파싱 및 검증
    const searchParams = request.nextUrl.searchParams
    const rawQuery = {
      date_from: searchParams.get("date_from") ?? undefined,
      date_to: searchParams.get("date_to") ?? undefined,
      user_id: searchParams.get("user_id") ?? undefined,
      page: searchParams.get("page") ?? "1",
      per_page: searchParams.get("per_page") ?? "20",
    }

    const parsed = reportListQuerySchema.safeParse(rawQuery)
    if (!parsed.success) {
      return validationError(parsed.error)
    }

    const query = parsed.data

    // 3. 페이지네이션 파라미터 정규화
    const perPage = Math.min(query.per_page, 100)
    const page = Math.max(query.page, 1)
    const skip = (page - 1) * perPage

    // 4. 기본 날짜 범위 계산 (오늘 기준 -30일 ~ 오늘)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const defaultFrom = new Date()
    defaultFrom.setDate(defaultFrom.getDate() - 30)
    defaultFrom.setHours(0, 0, 0, 0)

    const dateFrom = query.date_from ? new Date(query.date_from + "T00:00:00Z") : defaultFrom
    const dateTo = query.date_to ? new Date(query.date_to + "T23:59:59Z") : todayEnd

    // 5. WHERE 조건 구성
    // SALES: 본인 보고서만 (user_id 파라미터 무시)
    // MANAGER: user_id 파라미터로 필터 가능, 없으면 전체
    const whereUserId: number | undefined =
      session.role === "SALES" ? session.userId : query.user_id

    const where = {
      reportDate: {
        gte: dateFrom,
        lte: dateTo,
      },
      ...(whereUserId !== undefined ? { userId: whereUserId } : {}),
    }

    // 6. 총 건수와 목록을 병렬로 조회
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
            select: {
              userId: true,
              name: true,
              department: true,
            },
          },
          _count: {
            select: { visitRecords: true },
          },
        },
      }),
    ])

    const totalPages = Math.ceil(total / perPage)

    // 7. snake_case 응답 형식으로 변환
    const data = reports.map((r) => ({
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

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: totalPages,
      },
    })
  } catch (error) {
    if (error instanceof ApiError) {
      return error.toResponse()
    }
    console.error("[GET /api/reports]", error)
    return apiError(500, "INTERNAL_ERROR", "서버 오류가 발생했습니다.")
  }
}
