import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * Endpoint de Webhook para recibir notificaciones de Transbank (Webpay).
 * Esto es llamado de servidor a servidor.
 */
export async function POST(req: Request) {
  console.log('[Webhook Webpay] Notificación recibida...');

  try {
    // --- 1. (SIMULACIÓN) Autenticación del Webhook ---
    // En producción, Webpay envía un 'header' (ej. 'X-Transbank-Signature')
    // que debes verificar con una clave secreta para asegurar que la
    // llamada es legítima y no de un atacante.
    const headerList = await headers();
    const authHeader = headerList.get('Authorization');
    
    // Aquí simulamos que requerimos un 'Bearer token' simple.
    // En tu .env.local deberías tener: WEBPAY_WEBHOOK_SECRET="tu_clave_secreta"
    const webhookSecret = process.env.WEBPAY_WEBHOOK_SECRET;

    if (authHeader !== `Bearer ${webhookSecret}`) {
      console.warn('[Webhook Webpay] Autenticación de Webhook fallida.');
      // Ojo: algunos servicios prefieren un 200 para evitar reintentos,
      // pero un 401 es más claro para debugging.
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    // --- Fin Simulación de Autenticación ---


    // 2. Obtener el cuerpo de la notificación
    // (Simplificamos el cuerpo. Webpay real es más complejo)
    const body = await req.json();
    console.log('[Webhook Webpay] Cuerpo:', JSON.stringify(body, null, 2));

    const { compraId, status: webpayStatus } = body;

    if (!compraId || !webpayStatus) {
      return NextResponse.json(
        { error: 'Datos de webhook incompletos' },
        { status: 400 },
      );
    }

    // 3. Buscar la compra en la base de datos
    const compra = await prisma.compra.findUnique({
      where: { id: compraId },
      select: { id: true, status: true },
    });

    if (!compra) {
      console.error(
        `[Webhook Webpay] Error: Compra ${compraId} no encontrada.`,
      );
      // Devolvemos 404, aunque Webpay podría reintentar.
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });
    }

    // 4. (CLAVE) Lógica de Idempotencia
    // Si la compra ya está 'pagada' (porque el webhook llegó dos veces),
    // no hacemos nada y solo devolvemos éxito.
    if (compra.status === 'pagada') {
      console.log(
        `[Webhook Webpay] Compra ${compraId} ya estaba pagada. (Idempotencia)`,
      );
      return NextResponse.json({ ok: true, message: 'Ya procesada' });
    }

    // 5. Actualizar el estado de la compra
    if (webpayStatus === 'AUTHORIZED') {
      // ¡Éxito! Actualizar la base de datos
      await prisma.compra.update({
        where: { id: compraId },
        data: { status: 'pagada' },
      });
      console.log(
        `[Webhook Webpay] Compra ${compraId} actualizada a 'pagada'.`,
      );

      // --- ¡ACCIÓN FUTURA! ---
      // Aquí es donde deberías:
      // 1. Enviar un email de confirmación al usuario.
      // 2. Generar y enviar los QR/PDF de las entradas.
      // 3. Descontar el 'capacity' del TicketType.

    } else {
      // El pago falló (ej. 'FAILED', 'REJECTED')
      await prisma.compra.update({
        where: { id: compraId },
        data: { status: 'fallida' },
      });
      console.log(
        `[Webhook Webpay] Compra ${compraId} actualizada a 'fallida'.`,
      );
    }

    // 6. Responder a Webpay con Éxito
    // Es crucial devolver un 200 OK para que Webpay sepa que
    // recibimos la notificación y no la reintente.
    return NextResponse.json({ ok: true });
    
  } catch (e) {
    console.error('[Webhook Webpay] Error:', e);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}