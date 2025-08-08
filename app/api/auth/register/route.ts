import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // ¿Usuario ya existe?
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return NextResponse.json({ ok: true, id: user.id });
}
