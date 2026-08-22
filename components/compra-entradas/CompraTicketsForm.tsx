'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaTicketAlt } from 'react-icons/fa';
import { FaCreditCard } from 'react-icons/fa';
import { SiMercadopago } from 'react-icons/si';
import toast from 'react-hot-toast';

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
      const errorMsg = 'Debes iniciar sesión para comprar.';
      setError(errorMsg);
      toast.error(errorMsg);
      setSubmitting(false);
      router.push('/auth/login'); // Redirige a login
      return;
    }

    // B. Formatear el carrito para la API (solo items con cantidad > 0)
    const itemsToPurchase: CartItem[] = Object.entries(cart)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({
        ticketTypeId,
        quantity,
      }));

    if (itemsToPurchase.length === 0) {
      const errorMsg = 'Debes seleccionar al menos una entrada.';
      setError(errorMsg);
      toast.error(errorMsg);
      setSubmitting(false);
      return;
    }

    const loadingToast = toast.loading('Creando orden de compra...');
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
        const errorMsg = json.error || 'No se pudo crear la orden.';
        setError(errorMsg);
        toast.error(errorMsg, { id: loadingToast });
        setSubmitting(false);
        return;
      }

      // D. ¡ÉXITO! Redirigir a la pasarela de pago (Webpay)
      const { redirectUrl } = json;
      if (!redirectUrl) {
        const errorMsg = 'No se pudo obtener la URL de pago.';
        setError(errorMsg);
        toast.error(errorMsg, { id: loadingToast });
        setSubmitting(false);
        return;
      }

      toast.success('Redirigiendo a la pasarela de pago...', { id: loadingToast });
      // Redirección del usuario al sitio de Webpay
      router.push(redirectUrl);
      // No seteamos submitting(false) porque estamos saliendo de la página
      
    } catch {
      const errorMsg = 'Error de red. Intenta de nuevo más tarde.';
      setError(errorMsg);
      toast.error(errorMsg, { id: loadingToast });
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-5"
    >
        {/* 7. Lista dinámica de tipos de tickets */}
        <div className="flex flex-col gap-5">
          {ticketTypes.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between border border-cyan-300/25 bg-[#0b0d12] p-4"
            >
              <div className="flex items-center gap-3">
                <FaTicketAlt className="text-xl text-cyan-300" aria-hidden="true" />
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {ticket.name}
                  </h3>
                  <p className="font-bold text-rose-300">
                    ${ticket.price.toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
              <input
                type="number"
                min={0}
                value={cart[ticket.id] || 0}
                onChange={(e) =>
                  handleQuantityChange(ticket.id, e.target.valueAsNumber)
                }
                className="h-11 w-20 border border-cyan-300/40 bg-black/70 text-center text-white outline-none transition focus-visible:border-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                aria-label={`Cantidad para ${ticket.name}`}
              />
            </div>
          ))}
        </div>

        {/* 8. Total calculado */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-white/90">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-rose-300">
            ${total.toLocaleString('es-CL')}
          </span>
        </div>

        <div className="border-t border-white/10 pt-4">
          <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.12em] text-white/80">
            Selecciona tu método de pago
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('WEBPAY')}
              className={`flex min-h-12 items-center justify-center gap-2 border-2 text-center text-sm font-semibold transition ${
                paymentMethod === 'WEBPAY'
                  ? 'border-cyan-300 bg-cyan-300/15 text-white shadow-[0_0_14px_rgba(34,211,238,0.25)]'
                  : 'border-white/15 bg-black/40 text-white/60 hover:border-white/30'
              }`}
            >
              <FaCreditCard aria-hidden="true" /> Webpay
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('MERCADOPAGO')}
              className={`flex min-h-12 items-center justify-center gap-2 border-2 text-center text-sm font-semibold transition ${
                paymentMethod === 'MERCADOPAGO'
                  ? 'border-cyan-300 bg-cyan-300/15 text-white shadow-[0_0_14px_rgba(34,211,238,0.25)]'
                  : 'border-white/15 bg-black/40 text-white/60 hover:border-white/30'
              }`}
            >
              <SiMercadopago aria-hidden="true" /> Mercado Pago
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || total === 0}
          className="evento-cta mt-1 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Procesando...' : 'Ir a pagar'}
        </button>

        {error && (
          <p className="text-center text-sm font-semibold text-rose-400">{error}</p>
        )}
    </form>
  );
}