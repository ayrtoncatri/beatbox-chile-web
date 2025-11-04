import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

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