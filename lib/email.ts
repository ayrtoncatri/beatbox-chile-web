import { Resend } from 'resend';

// Inicializamos el cliente de Resend
// Asegúrate de tener RESEND_API_KEY en tu .env
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email: string, token: string) => {
  // Construimos el link. Asegúrate de tener NEXTAUTH_URL en tu .env
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Beatbox Chile <no-reply@beatboxchile.cl', // Si aún no verificas dominio, usa este remitente de prueba
      to: email,
      subject: 'Restablece tu contraseña - Beatbox Chile',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña para tu cuenta en Beatbox Chile.</p>
          <p>Haz clic en el siguiente botón para continuar (el enlace expira en 1 hora):</p>
          <a href="${resetLink}" style="background-color: #4F46E5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px; font-weight: bold;">
            Restablecer Contraseña
          </a>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error enviando correo con Resend:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Excepción al enviar correo:", err);
    return false;
  }
};