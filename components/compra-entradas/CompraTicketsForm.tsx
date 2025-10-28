'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaTicketAlt } from 'react-icons/fa';
import { FaCreditCard } from 'react-icons/fa';
import { SiMercadopago } from 'react-icons/si';

// 1. Definimos los tipos de props que este componente recibirá
// (Estos vienen de la página del evento, app/eventos/[id])
type TicketTypeProp = {
  id: string;
  name: string;
  price: number;
  capacity: number | null; // (Podemos usar 'capacity' para validaciones futuras)
};

interface CompraTicketsFormProps {
  eventoId: string;
  ticketTypes: TicketTypeProp[];
}

// 2. Definimos la estructura del "carrito" que enviaremos a la API
type CartItem = {
  ticketTypeId: string;
  quantity: number;
};

type PaymentMethod = 'WEBPAY' | 'MERCADOPAGO';

export default function CompraTicketsForm({
  eventoId,
  ticketTypes,
}: CompraTicketsFormProps) {
  // 3. Estado del "Carrito": { "id_del_ticket": cantidad, ... }
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WEBPAY');

  const { data: session } = useSession();
  const router = useRouter();

  // 4. Handler para actualizar la cantidad de un ticket
  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    // Asegura que la cantidad no sea negativa
    const numQuantity = Math.max(0, quantity);
    
    setCart((prevCart) => ({
      ...prevCart,
      [ticketTypeId]: numQuantity,
    }));
  };

  // 5. Cálculo del total (se actualiza cada vez que el 'cart' cambia)
  const total = useMemo(() => {
    return ticketTypes.reduce((acc, ticketType) => {
      const quantity = cart[ticketType.id] || 0;
      return acc + quantity * ticketType.price;
    }, 0);
  }, [cart, ticketTypes]);

  // 6. Handler para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // A. Validar sesión
    if (!session) {
      setError('Debes iniciar sesión para comprar.');
      setSubmitting(false);
      router.push('/auth/login'); // Redirige a login
      return;
    }

    // B. Formatear el carrito para la API (solo items con cantidad > 0)
    const itemsToPurchase: CartItem[] = Object.entries(cart)
      .filter(([id, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({
        ticketTypeId,
        quantity,
      }));

    if (itemsToPurchase.length === 0) {
      setError('Debes seleccionar al menos una entrada.');
      setSubmitting(false);
      return;
    }

    try {
      // C. Llamar a la *NUEVA* API de "Crear Orden"
      const res = await fetch('/api/compra/crear-orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: eventoId,
          items: itemsToPurchase,
          paymentMethod: paymentMethod,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'No se pudo crear la orden.');
        setSubmitting(false);
        return;
      }

      // D. ¡ÉXITO! Redirigir a la pasarela de pago (Webpay)
      const { redirectUrl } = json;
      if (!redirectUrl) {
        setError('No se pudo obtener la URL de pago.');
        setSubmitting(false);
        return;
      }

      // Redirección del usuario al sitio de Webpay
      router.push(redirectUrl);
      // No seteamos submitting(false) porque estamos saliendo de la página
      
    } catch (err) {
      setError('Error de red. Intenta de nuevo más tarde.');
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 relative z-10 max-w-2xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-8 text-lime-300 drop-shadow-lg text-center">
        Comprar Entradas
      </h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-gradient-to-br from-gray-900/80 via-neutral-900/80 to-lime-400/10
                   backdrop-blur-lg border border-lime-400/20 shadow-2xl
                   hover:shadow-lime-500/40 p-8 rounded-2xl flex flex-col gap-6
                   transition-all duration-400"
      >
        {/* 7. Lista dinámica de tipos de tickets */}
        <div className="flex flex-col gap-5">
          {ticketTypes.map((ticket) => (
            <div
              key={ticket.id}
              className="flex justify-between items-center bg-neutral-800/50 p-4 rounded-lg border border-lime-400/20"
            >
              <div className="flex items-center gap-3">
                <FaTicketAlt className="text-lime-400 text-xl" />
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {ticket.name}
                  </h4>
                  <p className="text-lime-300 font-bold">
                    ${ticket.price.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
              <input
                type="number"
                min={0}
                // max={ticket.capacity || 20} // (Podemos añadir lógica de capacidad aquí luego)
                value={cart[ticket.id] || 0}
                onChange={(e) =>
                  handleQuantityChange(ticket.id, e.target.valueAsNumber)
                }
                className="w-20 bg-neutral-900/80 border border-lime-400/40 focus:border-lime-300 text-white p-2 rounded-xl text-center outline-none transition-all"
                aria-label={`Cantidad para ${ticket.name}`}
              />
            </div>
          ))}
        </div>

        {/* 8. Total calculado */}
        <div className="border-t border-lime-400/30 pt-4 flex items-center justify-between text-lime-200/90">
          <span className="text-xl font-semibold">Total</span>
          <span className="text-lime-300 font-bold text-2xl">
            ${total.toLocaleString('es-CL')}
          </span>
        </div>

        {/* --- 9. SELECCIÓN DE MÉTODO DE PAGO --- */}
        <div className="border-t border-lime-400/30 pt-4">
          <span className="text-lg font-semibold text-lime-200/90 mb-3 block">
            Selecciona tu método de pago
          </span>
          <div className="grid grid-cols-2 gap-4">
            {/* Botón Webpay */}
            <button
              type="button" // Previene que envíe el formulario
              onClick={() => setPaymentMethod('WEBPAY')}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 text-center font-semibold transition-all ${
                paymentMethod === 'WEBPAY'
                  ? 'bg-lime-500/20 border-lime-400 text-white shadow-lime-500/40'
                  : 'bg-neutral-800/50 border-neutral-700 text-gray-400 hover:bg-neutral-700'
              }`}
            >
              <FaCreditCard /> Webpay
            </button>
            {/* Botón Mercado Pago */}
            <button
              type="button" // Previene que envíe el formulario
              onClick={() => setPaymentMethod('MERCADOPAGO')}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 text-center font-semibold transition-all ${
                paymentMethod === 'MERCADOPAGO'
                  ? 'bg-lime-500/20 border-lime-400 text-white shadow-lime-500/40'
                  : 'bg-neutral-800/50 border-neutral-700 text-gray-400 hover:bg-neutral-700'
              }`}
            >
              <SiMercadopago /> Mercado Pago
            </button>
          </div>
        </div>

        {/* 10. Botón de envío */}
        <button
          type="submit"
          disabled={submitting || total === 0}
          className="bg-gradient-to-r from-lime-500 via-lime-400 to-green-400
                     text-gray-900 font-bold py-3 px-6 rounded-xl mt-2
                     hover:scale-105 hover:shadow-lg transition-all duration-300
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Procesando...' : 'Ir a Pagar'}
        </button>

        {error && (
          <p className="mt-2 text-red-400 font-semibold text-center">{error}</p>
        )}
      </form>
    </section>
  );
}