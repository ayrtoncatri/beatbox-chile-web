// app/api/compra/confirmar/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tx } from '@/lib/transbank'; // <- Importar nuestra instancia

/**
 * Endpoint para CONFIRMAR una transacción de Webpay.
 * Esta API es llamada por nuestra propia página de /compra/resultado
 * después de que el usuario regresa de Webpay con un token.
 */
export async function POST(req: Request) {
  console.log('[Confirmar Compra] Solicitud recibida...');

  try {
    // 1. Obtener el token_ws desde nuestro frontend
    const body = await req.json();
    const { token_ws } = body;

    if (!token_ws) {
      console.warn('[Confirmar Compra] No se encontró token_ws en el body.');
      return NextResponse.json({ error: 'Token no provisto' }, { status: 400 });
    }

    console.log(`[Confirmar Compra] Confirmando token: ${token_ws}`);

    // 2. (REAL) Confirmar la transacción con Transbank
    const commitResponse = await tx.commit(token_ws);
    console.log('[Confirmar Compra] Respuesta de Commit:', commitResponse);

    const {
      buy_order: compraId,
      status: webpayStatus,
      response_code: responseCode,
      amount,
      transaction_date: transactionDate,
      payment_type_code: paymentTypeCode,
      card_detail: { card_number: lastCardDigits },
    } = commitResponse;

    // 3. Buscar la compra en la base de datos
    const compra = await prisma.compra.findUnique({
      where: { id: compraId },
      select: { id: true, status: true, total: true },
    });

    if (!compra) {
      console.error(
        `[Confirmar Compra] Error: Compra ${compraId} (de token) no encontrada.`,
      );
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });
    }

    // 4. (CLAVE) Lógica de Idempotencia
    if (compra.status === 'pagada') {
      console.log(
        `[Confirmar Compra] Compra ${compraId} ya estaba pagada. (Idempotencia)`,
      );
      return NextResponse.json({
        status: 'success',
        message: 'Ya procesada',
        compraId: compra.id,
        amount: amount,
      });
    }

    // 5. Validar Monto (Doble chequeo de seguridad)
    if (compra.total !== amount) {
      console.error(
        `[Confirmar Compra] ALERTA DE SEGURIDAD: Monto no coincide. DB: ${compra.total}, Webpay: ${amount}`,
      );
      // Reversar la transacción
      await tx.refund(token_ws, amount);
      await prisma.compra.update({
        where: { id: compraId },
        data: { status: 'fallida' }, // O un estado 'en_revision'
      });
      return NextResponse.json(
        { status: 'error', error: 'Monto de pago inválido' },
        { status: 400 },
      );
    }

    // 6. Actualizar el estado de la compra
    if (webpayStatus === 'AUTHORIZED' && responseCode === 0) {
      // ¡Éxito!
      await prisma.compra.update({
        where: { id: compraId },
        data: { status: 'pagada' },
      });
      console.log(`[Confirmar Compra] Compra ${compraId} actualizada a 'pagada'.`);

      // --- ¡ACCIÓN FUTURA! ---
      // (Aquí va tu lógica de enviar emails, QR, descontar stock, etc.)

      // Devolvemos éxito al frontend
      return NextResponse.json({
        status: 'success',
        compraId: compra.id,
        amount: amount,
        transactionDate: transactionDate,
        paymentType: paymentTypeCode,
        lastCardDigits: lastCardDigits,
      });
    } else {
      // El pago falló ('FAILED', 'NULLIFIED', 'REJECTED')
      await prisma.compra.update({
        where: { id: compraId },
        data: { status: 'fallida' },
      });
      console.log(
        `[Confirmar Compra] Compra ${compraId} actualizada a 'fallida'. Status: ${webpayStatus}`,
      );
      return NextResponse.json({
        status: 'failed',
        error: 'Pago fallido o rechazado',
      });
    }
  } catch (e) {
    console.error('[Confirmar Compra] Error fatal:', e);
    // Devolvemos 500 para que nuestro frontend sepa que algo salió mal
    return NextResponse.json(
      { status: 'error', error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}