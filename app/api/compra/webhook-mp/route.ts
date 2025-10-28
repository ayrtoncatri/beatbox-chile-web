// app/api/compra/webhook-mp/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// 1. Inicializar el SDK (solo para validar el pago)
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;
const client = new MercadoPagoConfig({ accessToken: accessToken });
const payment = new Payment(client);

export async function POST(req: Request) {
  console.log('[Webhook MP] Notificación recibida...');

  try {
    const body = await req.json();
    const searchParams = new URL(req.url).searchParams;
    
    // 2. Validar el tipo de notificación
    // Solo nos interesa cuando un pago se crea o actualiza
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log(`[Webhook MP] Procesando paymentId: ${paymentId}`);

      // 3. Buscar la información del pago en Mercado Pago
      const paymentData = await payment.get({ id: paymentId });
      
      if (!paymentData) {
        throw new Error('Datos del pago no encontrados en MP');
      }

      const compraId = paymentData.external_reference;
      const status = paymentData.status; // ej. "approved", "rejected"

      if (!compraId) {
        throw new Error('external_reference (compraId) no encontrado en el pago');
      }

      // 4. Buscar la compra en nuestra BBDD
      const compra = await prisma.compra.findUnique({
        where: { id: compraId },
        select: { id: true, status: true },
      });

      if (!compra) {
        console.error(`[Webhook MP] Compra ${compraId} no encontrada.`);
        // Devolvemos 404
        return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });
      }

      // 5. Lógica de Idempotencia
      if (compra.status === 'pagada' || compra.status === 'fallida') {
        console.log(`[Webhook MP] Compra ${compraId} ya procesada. (Idempotencia)`);
        return NextResponse.json({ ok: true, message: 'Ya procesada' });
      }

      // 6. Actualizar nuestra BBDD según el estado de MP
      if (status === 'approved') {
        await prisma.compra.update({
          where: { id: compraId },
          data: { status: 'pagada' },
        });
        console.log(`[Webhook MP] Compra ${compraId} actualizada a 'pagada'.`);
        // (Aquí también iría tu lógica de enviar emails, QR, etc.)

      } else if (status === 'rejected' || status === 'cancelled' || status === 'refunded') {
        await prisma.compra.update({
          where: { id: compraId },
          data: { status: 'fallida' },
        });
        console.log(`[Webhook MP] Compra ${compraId} actualizada a 'fallida'.`);
      }
      // (Ignoramos el estado 'pending' o 'in_process', la dejamos como 'pendiente' en nuestra BBDD)
    }

    // 7. Responder 200 OK a Mercado Pago
    return NextResponse.json({ ok: true });
    
  } catch (e: any) {
    console.error('[Webhook MP] Error:', e.message);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}