import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicApiPaths = new Set(["/api/auth/login", "/api/auth/logout"]);

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    if (!publicApiPaths.has(pathname) && !token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    return NextResponse.next();
  }

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/:path*"],
};
