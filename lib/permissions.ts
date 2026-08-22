import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const PRIVILEGED_ROLES = ["admin", "judge"];

/**
 * Guard de las paginas MFA. Consulta el estado de enrolamiento en la base de datos
 * en vez de confiar en el claim mfaEnabled del JWT, que queda desactualizado cuando
 * alguien se enrola con una sesion ya iniciada.
 */
export async function ensureMfaPage(mode: "setup" | "challenge", callbackUrl: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const roles = Array.isArray(session.user.roles) ? session.user.roles : [];
  if (!roles.some((role) => PRIVILEGED_ROLES.includes(role))) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });
  const mfaEnabled = user?.totpEnabled === true;

  if (mode === "setup" && mfaEnabled) {
    redirect(`/auth/mfa/challenge?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (mode === "challenge" && !mfaEnabled) {
    redirect(`/auth/mfa/setup?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return session;
}

export async function ensureAdminPage() {
  const session = await getServerSession(authOptions);
  const roles = (session as any)?.user?.roles;
  
  if (!session?.user) {
    // Si no hay sesión, al login
    redirect("/auth/login");
  }

  if (!roles || !Array.isArray(roles) || !roles.includes("admin")) {
    // Si no es admin, a la página de inicio
    redirect("/");
  }

  return session;

}

export async function ensureAdminApi() {
  const session = await getServerSession(authOptions);

  const roles = (session as any)?.user?.roles;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //Comprobar si el array 'roles' incluye "admin"
  if (!roles || !Array.isArray(roles) || !roles.includes("admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Si pasa las validaciones, no devolvemos nada (null) para que la API continúe
  return null;

}

export async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const roles = (session as any)?.user?.roles;

  if (!session?.user) {
    throw new Error("No has iniciado sesión");
  }

  //  Comprobar si el array 'roles' incluye "admin"
  if (!roles || !Array.isArray(roles) || !roles.includes("admin")) {
    throw new Error("No tienes permisos para realizar esta acción");
  }

  return session;
}