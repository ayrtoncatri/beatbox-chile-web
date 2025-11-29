import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import { createHash } from "crypto";

// Validamos que venga el token y que la contraseña sea segura
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validar datos de entrada
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // 2. Recrear el hash del token para buscarlo en la BD
    // (Recuerda: en la URL va el token original, en la BD va el hash)
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // 3. Buscar el token en la base de datos
    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }, // Traemos al usuario asociado
    });

    // 4. Verificar si el token existe
    if (!storedToken) {
      return NextResponse.json(
        { error: "Token inválido o ya utilizado." },
        { status: 400 }
      );
    }

    // 5. Verificar si el token expiró
    if (new Date() > storedToken.expiresAt) {
      // Borramos el token expirado para mantener limpieza
      await prisma.passwordResetToken.delete({ where: { id: storedToken.id } });
      
      return NextResponse.json(
        { error: "El enlace ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // 6. Hashear la NUEVA contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Transacción: Actualizar usuario Y borrar token al mismo tiempo
    await prisma.$transaction([
      // A. Actualizamos la password del usuario
      prisma.user.update({
        where: { id: storedToken.userId },
        data: { password: hashedPassword },
      }),
      // B. Borramos el token usado para que no se pueda reusar
      prisma.passwordResetToken.delete({
        where: { id: storedToken.id },
      }),
    ]);

    return NextResponse.json(
      { message: "Contraseña actualizada correctamente" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}