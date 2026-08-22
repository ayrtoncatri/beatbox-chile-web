import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasValidMfaSession, mfaCookieName } from "@/lib/mfa-edge";

const ADMIN_PATHS = [/^\/admin(\/|$)/, /^\/api\/admin(\/|$)/];
const PRIVILEGED_PATHS = [...ADMIN_PATHS, /^\/judge(\/|$)/, /^\/api\/judge(\/|$)/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminScope = ADMIN_PATHS.some((re) => re.test(pathname));
  const isPrivilegedScope = PRIVILEGED_PATHS.some((re) => re.test(pathname));
  if (!isPrivilegedScope) return NextResponse.next();

  // Usamos el secret para desencriptar el JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isApi = pathname.startsWith("/api/");

  // Si no hay token (no logueado), redirigir
  if (!token) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // --- INICIO DE LA CORRECCIÓN ---

  // 1. Obtenemos el array 'roles' del token (que definimos en lib/auth.ts)
  const roles = (token as any).roles;

  // 2. Comprobamos si 'roles' es un array Y si incluye "admin"
  const hasAdminRole = Array.isArray(roles) && roles.includes("admin");
  const hasJudgeRole = Array.isArray(roles) && roles.includes("judge");
  const hasRequiredRole = isAdminScope ? hasAdminRole : (hasAdminRole || hasJudgeRole);

  if (!hasRequiredRole) {
    // Si no es admin, lo redirigimos
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/", req.url));
  }

  const userId = token.sub;
  const mfaEnabled = (token as any).mfaEnabled === true;
  const mfaVerified = userId
    ? await hasValidMfaSession(req.cookies.get(mfaCookieName)?.value, userId)
    : false;

  if (!mfaEnabled || !mfaVerified) {
    if (isApi) {
      return NextResponse.json(
        { error: "MFA_REQUIRED", setupRequired: !mfaEnabled },
        { status: 403 },
      );
    }

    const mfaUrl = new URL(mfaEnabled ? "/auth/mfa/challenge" : "/auth/mfa/setup", req.url);
    mfaUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(mfaUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/judge/:path*", "/api/judge/:path*"],
};