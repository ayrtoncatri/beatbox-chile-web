import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_PATHS = [/^\/admin(\/|$)/, /^\/api\/admin(\/|$)/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminScope = ADMIN_PATHS.some((re) => re.test(pathname));
  if (!isAdminScope) return NextResponse.next();

  const token = await getToken({ req });
  const isApi = pathname.startsWith("/api/");

  if (!token) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const role = (token as any).role ?? (token as any).user?.role;
  if (role !== "admin") {
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};