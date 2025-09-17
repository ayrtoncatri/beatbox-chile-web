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
    const { nombres, apellidoPaterno, apellidoMaterno, comuna, region, edad, email, password } = await req.json();

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
    const safeComuna = sanitize(comuna);
    const safeRegion = sanitize(region);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Mensaje genérico para evitar enumeración de usuarios
      return NextResponse.json({ error: "No se pudo registrar" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        nombres: safeNombres ?? null,
        apellidoPaterno: safeApellidoPaterno ?? null,
        apellidoMaterno: safeApellidoMaterno ?? null,
        comuna: safeComuna ?? null,
        region: safeRegion ?? null,
        edad: edad ?? null,
        email,
        password: hashed,
        role: "user"
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
  } catch (err: any) {
    // Mensaje genérico para evitar fuga de información
    return NextResponse.json({ error: "No se pudo registrar" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;