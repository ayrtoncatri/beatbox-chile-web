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

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isApi = pathname.startsWith("/api/");

  if (!token) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  const roles = Array.isArray(token.roles) ? token.roles : [];
  const hasAdminRole = roles.includes("admin");
  const hasJudgeRole = roles.includes("judge");
  const hasRequiredRole = isAdminScope ? hasAdminRole : (hasAdminRole || hasJudgeRole);

  if (!hasRequiredRole) {
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/", req.url));
  }

  const userId = token.sub;
  const mfaEnabled = token.mfaEnabled === true;

  // La cookie va firmada por el servidor y ligada al userId, y solo se emite tras
  // confirmar o superar el desafio: su validez basta como prueba del segundo factor.
  // El claim mfaEnabled del JWT puede venir desactualizado (se enrolo despues de
  // emitir el token), asi que solo decide a donde enviar a quien aun no verifico.
  const mfaVerified = userId
    ? await hasValidMfaSession(req.cookies.get(mfaCookieName)?.value, userId)
    : false;

  if (!mfaVerified) {
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