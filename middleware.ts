import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_PATHS = [/^\/admin(\/|$)/, /^\/api\/admin(\/|$)/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminScope = ADMIN_PATHS.some((re) => re.test(pathname));
  // Si no es una ruta de admin, no hacemos nada
  if (!isAdminScope) return NextResponse.next();

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
  if (!Array.isArray(roles) || !roles.includes("admin")) {
    // Si no es admin, lo redirigimos
    if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};