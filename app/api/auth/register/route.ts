import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Utilidades OWASP
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}
function sanitize(input: string) {
  return typeof input === "string" ? input.replace(/[<>"'`\\]/g, "") : input;
}

export async function POST(req: NextRequest) {
  try {
    const { nombres, apellidoPaterno, apellidoMaterno, email, password } = await req.json();

    // Validaciones OWASP
    if (!email || !password || !nombres || !apellidoPaterno || !apellidoMaterno) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: "Contraseña insegura" }, { status: 400 });
    }

    // Sanitizar entradas
    const safeNombres = sanitize(nombres);
    const safeApellidoPaterno = sanitize(apellidoPaterno);
    const safeApellidoMaterno = sanitize(apellidoMaterno);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "No se pudo registrar" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 1. Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        isActive: true,
      },
      select: { id: true },
    });

    // 2. Crear perfil
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        nombres: safeNombres,
        apellidoPaterno: safeApellidoPaterno,
        apellidoMaterno: safeApellidoMaterno,
      },
    });

    // 3. Asignar rol "user"
    const role = await prisma.role.findUnique({ where: { name: "user" } });
    if (role) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id }
      });
    }

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "No se pudo registrar" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;