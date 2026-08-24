import { Resend } from 'resend';

// Inicializamos el cliente de Resend
// Asegúrate de tener RESEND_API_KEY en tu .env
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Beatbox Chile <no-reply@beatboxchile.cl>';

export async function sendPrivacyRequestReceivedEmail(params: {
  email: string;
  requestId: string;
  right: string;
  deadlineAt: Date;
}) {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: 'Solicitud de privacidad recibida - Beatbox Chile',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Solicitud recibida</h2>
          <p>Recibimos tu solicitud de <strong>${params.right}</strong>.</p>
          <p>Folio: <code>${params.requestId}</code></p>
          <p>Plazo legal de respuesta: 30 dias corridos (hasta ${params.deadlineAt.toISOString().slice(0, 10)}), prorrogable una sola vez por 30 dias.</p>
          <p>Si no reconoces esta solicitud, responde a este correo o escribe a privacidad@[COMPLETAR dominio].</p>
        </div>
      `,
    });
    if (error) {
      console.error('Privacy received email error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Privacy received email exception:', err);
    return false;
  }
}

export async function sendPrivacyRequestClosedEmail(params: {
  email: string;
  requestId: string;
  right: string;
  status: 'COMPLETED' | 'REJECTED';
  message: string;
}) {
  try {
    const title = params.status === 'COMPLETED' ? 'Solicitud completada' : 'Solicitud rechazada';
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: `${title} - Beatbox Chile`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>${title}</h2>
          <p>Tu solicitud de <strong>${params.right}</strong> (folio <code>${params.requestId}</code>) fue actualizada.</p>
          <p>${params.message}</p>
          <p>Puedes reclamar ante la Agencia de Proteccion de Datos Personales de Chile.</p>
        </div>
      `,
    });
    if (error) {
      console.error('Privacy closed email error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Privacy closed email exception:', err);
    return false;
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  // Construimos el link. Asegúrate de tener NEXTAUTH_URL en tu .env
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  try {
    const { error } = await resend.emails.send({
      from: 'Beatbox Chile <no-reply@beatboxchile.cl>', // Si aún no verificas dominio, usa este remitente de prueba
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