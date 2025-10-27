import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// --- (INICIO) SIMULACIÓN DE WEBPAY ---
// Esto simula la llamada al SDK de Transbank.
// En el futuro, reemplazarás esto con el SDK real 'transbank-sdk'.
async function mockIntegrarWebpay(compraId: string, total: number) {
  console.log(
    `[Webpay MOCK] Iniciando transacción para Compra ID: ${compraId} por $${total}`,
  );
  
  // Aquí es donde llamarías a:
  // const transaction = await (new WebpayPlus.Transaction(...)).create(
  //   buyOrder,   // -> compraId
  //   sessionId,  // -> session.user.id
  //   amount,     // -> total
  //   returnUrl   // -> "https://tusitio.com/compra/resultado"
  // );
  // const redirectUrl = transaction.url + "?token_ws=" + transaction.token;

  // Como es un mock, creamos una URL de pago falsa.
  // Te redirigirá a una página de "éxito" que AÚN NO HEMOS CREADO.
  const mockToken = `token_ws_${Math.random().toString(36).substring(7)}`;
  const mockRedirectUrl = `/compra/resultado?token_ws=${mockToken}&compra_id=${compraId}`;

  // Simulamos una pequeña demora de la API
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(`[Webpay MOCK] URL de redirección: ${mockRedirectUrl}`);
  
  return {
    redirectUrl: mockRedirectUrl,
  };
}
// --- (FIN) SIMULACIÓN DE WEBPAY ---


// --- El Endpoint de la API ---

export async function POST(req: Request) {
  try {
    // 1. Validar Sesión
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Obtener y validar el Body
    const body = await req.json();
    const { eventoId, items } = body;

    if (!eventoId) {
      return NextResponse.json(
        { error: 'ID de evento faltante' },
        { status: 400 },
      );
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Carrito de compras vacío' },
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
    // Esto asegura que la Compra y sus Items se creen juntos, o no se cree nada.
    const nuevaCompra = await prisma.compra.create({
      data: {
        userId: userId,
        eventoId: eventoId,
        total: total,
        status: 'pendiente', // <- Usamos el 'default' del schema que cambiamos
        items: {
          create: itemsParaCrear, // Crea los 'CompraItem' anidados
        },
      },
      select: {
        id: true, // <- Necesitamos el ID para Webpay
        total: true,
      },
    });

    // 6. Integrar con Webpay (Usando nuestro MOCK)
    const webpayResponse = await mockIntegrarWebpay(
      nuevaCompra.id,
      nuevaCompra.total,
    );

    // 7. Devolver la URL de redirección al frontend
    return NextResponse.json(
      { redirectUrl: webpayResponse.redirectUrl },
      { status: 201 },
    );
    
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}