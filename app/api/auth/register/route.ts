import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Utilidades OWASP
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isStrongPassword(password: string) {
  // Mínimo 8 caracteres, 1 minúscula, 1 mayúscula, 1 número, 1 símbolo
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}
function sanitize(input: string) {
  // Evitar XSS básico
  return typeof input === "string" ? input.replace(/[<>"'`\\]/g, "") : input;
}

export async function POST(req: NextRequest) {
  try {
    const { nombres, apellidoPaterno, apellidoMaterno, email, password } = await req.json();

    // Validaciones OWASP
    if (!email || !password || !nombres || !apellidoPaterno) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: "Contraseña insegura. Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo." }, { status: 400 });
    }

    // Sanitizar entradas
    const safeNombres = sanitize(nombres);
    const safeApellidoPaterno = sanitize(apellidoPaterno);
    const safeApellidoMaterno = sanitize(apellidoMaterno) || "";

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "No se pudo registrar" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const userRole = await prisma.role.findUnique({ where: { name: "user" } });
    if (!userRole) {
      console.error("Error de configuración: El rol 'user' no existe en la base de datos.");
      return NextResponse.json({ error: "Error interno al configurar el usuario." }, { status: 500 });
    }

    // 1. Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        isActive: true,

        // a. Crea el UserProfile anidado (relación 1-a-1)
        profile: {
          create: {
            nombres: safeNombres,
            apellidoPaterno: safeApellidoPaterno,
            apellidoMaterno: safeApellidoMaterno,
          },
        },

        // b. Crea el UserRole anidado (relación muchos-a-muchos)
        roles: {
          create: {
            roleId: userRole.id,
          },
        },
      },
      select: { id: true, email: true },
    });

    return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
  } catch (err: any) {
    console.error("Error en API de registro:", err);
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return NextResponse.json({ error: "El correo electrónico ya está en uso" }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo registrar al usuario" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;