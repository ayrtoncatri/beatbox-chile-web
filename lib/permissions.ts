import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function ensureAdminPage() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  if (!session?.user) {
    redirect("/auth/login");
  }
  if (role !== "admin") {
    redirect("/");
  }
  return session;
}

export async function ensureAdminApi() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.user?.role;
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}