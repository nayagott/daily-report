import { type NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/auth/jwt"

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/refresh"]

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

function isApiRequest(pathname: string): boolean {
  return pathname.startsWith("/api/")
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    if (isApiRequest(pathname)) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "인증이 필요합니다." } },
        { status: 401 },
      )
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const payload = await verifyAccessToken(token)

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", String(payload.userId))
    requestHeaders.set("x-user-role", payload.role)

    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch {
    if (isApiRequest(pathname)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "토큰이 유효하지 않거나 만료되었습니다." },
        },
        { status: 401 },
      )
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * /login, /_next/static, /_next/image, /favicon.ico, /api/auth/login, /api/auth/refresh
     * 를 제외한 모든 경로에 미들웨어를 적용한다.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
