"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface ReportsPaginationProps {
  page: number
  totalPages: number
}

export function ReportsPagination({ page, totalPages }: ReportsPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const buildPageUrl = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(p))
      return `/reports?${params.toString()}`
    },
    [searchParams],
  )

  const handlePageClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, p: number) => {
      e.preventDefault()
      router.push(buildPageUrl(p))
    },
    [router, buildPageUrl],
  )

  if (totalPages <= 1) return null

  // 최대 5개 페이지 번호 표시
  const getPageNumbers = () => {
    const pages: number[] = []
    const delta = 2
    const left = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)

    for (let i = left; i <= right; i++) {
      pages.push(i)
    }
    return pages
  }

  const pageNumbers = getPageNumbers()
  const showLeftEllipsis = pageNumbers[0] > 2
  const showRightEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages - 1

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={buildPageUrl(page - 1)}
            onClick={(e) => handlePageClick(e, page - 1)}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pageNumbers[0] > 1 && (
          <PaginationItem>
            <PaginationLink
              href={buildPageUrl(1)}
              onClick={(e) => handlePageClick(e, 1)}
              isActive={page === 1}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}

        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pageNumbers.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href={buildPageUrl(p)}
              onClick={(e) => handlePageClick(e, p)}
              isActive={page === p}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <PaginationItem>
            <PaginationLink
              href={buildPageUrl(totalPages)}
              onClick={(e) => handlePageClick(e, totalPages)}
              isActive={page === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            href={buildPageUrl(page + 1)}
            onClick={(e) => handlePageClick(e, page + 1)}
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
