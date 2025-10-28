import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { tx, webpayReturnUrl } from '@/lib/transbank';
import { mpPreference, mpUrls } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    // 1. Validar Sesión
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    const userEmail = session?.user?.email;
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Obtener y validar el Body
    const body = await req.json();
    const { eventoId, items, paymentMethod } = body;

    if (
      !eventoId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Datos de carrito inválidos' },
        { status: 400 },
      );
    }
    if (!paymentMethod || !['WEBPAY', 'MERCADOPAGO'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pago no válido' },
        { status: 400 },
      );
    }

    // 3. (SEGURIDAD) Obtener precios de la Base de Datos
    // Obtenemos los IDs de los tickets que el cliente quiere comprar
    const ticketTypeIds = items.map((item) => item.ticketTypeId);

    // Buscamos esos tickets en la BBDD *para ese evento específico*
    const ticketTypesEnDB = await prisma.ticketType.findMany({
      where: {
        id: { in: ticketTypeIds },
        eventId: eventoId, // <- Seguridad: asegura que los tickets son de ese evento
        isActive: true,
      },
      select: { id: true, price: true, name: true, capacity: true },
    });

    // Mapear para fácil acceso: { 'id_ticket': precio }
    const preciosReales = new Map(
      ticketTypesEnDB.map((t) => [t.id, t.price]),
    );

    // 4. Calcular el Total (Basado en precios de la BBDD) y validar
    let total = 0;
    const itemsParaCrear: any[] = [];

    for (const item of items) {
      const precioUnitario = preciosReales.get(item.ticketTypeId);
      
      // Validar si el ticket existe o pertenece al evento
      if (precioUnitario === undefined) {
        return NextResponse.json(
          { error: `El ticket ${item.ticketTypeId} no es válido.` },
          { status: 400 },
        );
      }
      
      const cantidad = Number(item.quantity);
      if (!cantidad || cantidad < 1) {
        return NextResponse.json(
          { error: `Cantidad inválida para ${item.ticketTypeId}` },
          { status: 400 },
        );
      }
      
      // (Aquí podrías añadir lógica de validación de 'capacity' luego)
      
      const subtotal = precioUnitario * cantidad;
      total += subtotal;
      
      itemsParaCrear.push({
        ticketTypeId: item.ticketTypeId,
        quantity: cantidad,
        unitPrice: precioUnitario, // <- Precio real de la BBDD
        subtotal: subtotal,
      });
    }

    if (total === 0) {
      return NextResponse.json(
        { error: 'El total de la compra no puede ser cero.' },
        { status: 400 },
      );
    }

    // 5. Crear la Compra (¡En una transacción!)
    const nuevaCompra = await prisma.compra.create({
      data: {
        userId: userId,
        eventoId: eventoId,
        total: total,
        status: 'pendiente',
        items: {
          create: itemsParaCrear,
        },
      },
      include: {
        // Necesitamos los items creados para pasarlos a MP
        items: {
          include: {
            ticketType: { select: { name: true } }, // <-- Para el 'title' en MP
          },
        },
      },
    });

    // 6. (NUEVO) LÓGICA DEL "DIRECTOR" DE PAGOS
    let redirectUrl: string;

    if (paymentMethod === 'WEBPAY') {
      // --- LÓGICA WEBPAY (LA QUE YA TENÍAS) ---
      console.log(`[crear-orden] Iniciando Webpay para Compra ID: ${nuevaCompra.id}`);
      const transaction = await tx.create(
        nuevaCompra.id, // buyOrder
        userId, // sessionId
        nuevaCompra.total, // amount
        webpayReturnUrl, // returnUrl
      );
      redirectUrl = `${transaction.url}?token_ws=${transaction.token}`;
      
    } else if (paymentMethod === 'MERCADOPAGO') {
      // --- LÓGICA MERCADO PAGO (NUEVA) ---
      console.log(`[crear-orden] Iniciando Mercado Pago para Compra ID: ${nuevaCompra.id}`);

      const appUrl = process.env.APP_URL;

      if (!appUrl) {
        console.error('[crear-orden] ¡ERROR FATAL! process.env.APP_URL no está definido en el entorno de esta API.');
        throw new Error('Configuración de URL de la aplicación no encontrada.');
      }

      console.log(`[crear-orden] Usando APP_URL: ${appUrl}`);

      const back_urls = {
        success: `${appUrl}/compra/resultado-mp?status=success`,
        failure: `${appUrl}/compra/resultado-mp?status=failure`,
        pending: `${appUrl}/compra/resultado-mp?status=pending`,
      };
      const notification_url = `${appUrl}/api/compra/webhook-mp`;
      
      // a. Formatear items para el body de MP
      const itemsParaMP = nuevaCompra.items.map((item) => ({
        id: item.ticketTypeId,
        title: item.ticketType.name,
        description: 'Entrada para evento Beatbox Chile',
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: 'CLP', // Asumimos CLP
      }));

      // b. Crear la "Preferencia de Pago"
      const preference = await mpPreference.create({
        body: {
          items: itemsParaMP,
          payer: {
            email: userEmail,
          },
          external_reference: nuevaCompra.id, 
          back_urls: back_urls, // <-- Usamos las URLs locales
          notification_url: notification_url, // <-- Usamos la URL local
          auto_return: 'approved', 
        },
      });

      redirectUrl = preference.init_point!; // Esta es la URL de checkout de MP
    } else {
      // Por si acaso
      return NextResponse.json(
        { error: 'Método de pago no implementado' },
        { status: 500 },
      );
    }

    // 7. Devolver la URL de redirección (de Webpay O Mercado Pago)
    return NextResponse.json({ redirectUrl: redirectUrl }, { status: 201 });
    
  } catch (e) {
    console.error('[crear-orden] Error:', e);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}