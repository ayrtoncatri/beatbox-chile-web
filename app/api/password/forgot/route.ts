import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegúrate que esta ruta apunte a tu instancia de Prisma Client
import { z } from "zod";
import { generateResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

// Validamos que lo que llegue sea un email con formato correcto
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validación de input (Zod)
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }
    
    const { email } = result.data;

    // 2. Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. Lógica de seguridad:
    // Si el usuario existe, procedemos.
    // Si NO existe, NO hacemos nada, pero responderemos igual "éxito" abajo.
    if (user) {
      // A. Borrar tokens viejos de este usuario (limpieza)
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // B. Generar token y hash
      const { token, tokenHash } = generateResetToken();

      // C. Definir expiración (1 hora desde ahora)
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

      // D. Guardar el HASH en la BD (nunca el token real)
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      // E. Enviar el TOKEN REAL por correo
      // Nota: Si estás en modo prueba de Resend, recuerda que 'user.email' 
      // debe ser el mismo con el que te registraste en Resend.
      await sendPasswordResetEmail(user.email, token);
    }

    // 4. Respuesta Genérica (Anti-User Enumeration)
    // Siempre respondemos OK, para que un hacker no sepa qué correos están registrados.
    return NextResponse.json(
      { message: "Si el correo existe, recibirás las instrucciones." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot Password API Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}