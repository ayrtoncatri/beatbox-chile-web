// components/compra/resultado/ResultadoMpCliente.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// 1. Definimos los estados que Mercado Pago nos puede enviar
type MpStatus = 'loading' | 'success' | 'failure' | 'pending';

function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh]">
      <div
        className="w-16 h-16 rounded-full animate-spin
                   border-8 border-solid border-lime-400 border-t-transparent"
      ></div>
      <p className="mt-4 text-white text-xl">
        Obteniendo resultado de Mercado Pago...
      </p>
    </div>
  );
}

export default function ResultadoMpCliente() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<MpStatus>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // 2. Leemos el parámetro 'status' que definimos en lib/mercadopago.ts
    const statusParam = searchParams.get('status');

    if (statusParam === 'success') {
      setStatus('success');
      setMessage(
        'Hemos recibido tu pago exitosamente. Nuestro webhook ha confirmado la compra.',
      );
    } else if (statusParam === 'failure') {
      setStatus('failure');
      setMessage(
        'El pago fue rechazado o falló. No se ha realizado ningún cargo.',
      );
    } else if (statusParam === 'pending') {
      setStatus('pending');
      setMessage(
        'Tu pago está pendiente de procesamiento (ej. pago en efectivo). Te notificaremos cuando se apruebe.',
      );
    } else {
      // Caso por defecto si la URL es inválida
      setStatus('failure');
      setMessage('El estado del pago no es reconocido o es inválido.');
    }
  }, [searchParams]);

  // --- Renderizado según el estado ---

  // Estado 1: Éxito (Reutilizando tu UI)
  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-lg border border-lime-400/50 shadow-xl">
        <FaCheckCircle className="text-lime-400 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-gray-300 text-lg mb-8">{message}</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/perfil/compras" // (O /perfil/mis-compras)
            className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-all"
          >
            Ver mis compras
          </Link>
          <Link
            href="/eventos"
            className="bg-lime-500 text-gray-900 font-bold py-2 px-6 rounded-lg hover:bg-lime-400 transition-all"
          >
            Volver a Eventos
          </Link>
        </div>
      </div>
    );
  }

  // Estado 2: Pago Pendiente (Color Amarillo)
  if (status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-lg border border-yellow-500/50 shadow-xl">
        <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Pago Pendiente</h1>
        <p className="text-gray-300 text-lg mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/perfil/compras"
            className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-all"
          >
            Ver mis compras
          </Link>
        </div>
      </div>
    );
  }

  // Estado 3: Fallido (cubre 'failure' y 'loading')
  // (El estado 'loading' es cubierto por el Suspense, pero lo dejamos por si acaso)
  if (status === 'failure' || status === 'loading') {
    // Si el status es 'loading' pero el Suspense ya pasó, mostramos el spinner
    if (status === 'loading') {
      return <LoadingSpinner />;
    }
    
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-lg border border-red-500/50 shadow-xl">
        <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Pago Fallido</h1>
        <p className="text-gray-300 text-lg mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/eventos"
            className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-all"
          >
            Volver a Eventos
          </Link>
        </div>
      </div>
    );
  }

  return null;
}