import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name ?? null, email, password: hashed, role: "user" },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
  } catch (err: any) {
    // Prisma P2002 = unique violation (por si pasa la condición de arriba)
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });
    }
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
