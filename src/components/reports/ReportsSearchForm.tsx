"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface User {
  user_id: number
  name: string
  department?: string
}

interface ReportsSearchFormProps {
  isManager: boolean
  users?: User[]
}

export function ReportsSearchForm({ isManager, users = [] }: ReportsSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") ?? "")
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") ?? "")
  const [userId, setUserId] = useState(searchParams.get("user_id") ?? "")

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    if (dateFrom) params.set("date_from", dateFrom)
    if (dateTo) params.set("date_to", dateTo)
    if (isManager && userId) params.set("user_id", userId)
    params.set("page", "1")
    router.push(`/reports?${params.toString()}`)
  }, [dateFrom, dateTo, userId, isManager, router])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch()
    },
    [handleSearch],
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">기간:</span>
      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-40"
        aria-label="검색 시작일"
      />
      <span className="text-sm text-muted-foreground">~</span>
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-40"
        aria-label="검색 종료일"
      />
      {isManager && (
        <>
          <span className="text-sm text-muted-foreground">담당자:</span>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="w-40" aria-label="담당자 선택">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.user_id} value={String(u.user_id)}>
                  {u.name}
                  {u.department ? ` (${u.department})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      <Button onClick={handleSearch}>검색</Button>
    </div>
  )
}
