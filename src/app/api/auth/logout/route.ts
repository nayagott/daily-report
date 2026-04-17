import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { ApiError } from "@/lib/api-response"
import prisma from "@/lib/db/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request)

    await prisma.user.update({
      where: { userId: session.userId },
      data: { refreshToken: null },
    })

    const response = NextResponse.json({ success: true, data: null }, { status: 200 })
    response.cookies.delete("access_token")
    response.cookies.delete("refresh_token")

    return response
  } catch (err) {
    if (err instanceof ApiError) {
      return err.toResponse()
    }
    throw err
  }
}
