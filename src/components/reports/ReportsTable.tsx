"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ReportListItem } from "@/types/api"

interface ReportsTableProps {
  reports: ReportListItem[]
  page: number
  perPage: number
}

function formatDate(isoDate: string): string {
  // "2026-04-13" → "04/13"
  const parts = isoDate.split("-")
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`
  }
  return isoDate
}

function formatDateTime(isoString: string): string {
  const d = new Date(isoString)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

export function ReportsTable({ reports, page, perPage }: ReportsTableProps) {
  const router = useRouter()

  if (reports.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>방문건수</TableHead>
              <TableHead>작성일시</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                조회된 보고서가 없습니다.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>날짜</TableHead>
            <TableHead>담당자</TableHead>
            <TableHead>방문건수</TableHead>
            <TableHead>작성일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report, idx) => (
            <TableRow
              key={report.report_id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/reports/${report.report_id}`)}
            >
              <TableCell>{(page - 1) * perPage + idx + 1}</TableCell>
              <TableCell>{formatDate(report.report_date)}</TableCell>
              <TableCell>
                {report.user.name}
                {report.user.department ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({report.user.department})
                  </span>
                ) : null}
              </TableCell>
              <TableCell>{report.visit_count}건</TableCell>
              <TableCell>{formatDateTime(report.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
