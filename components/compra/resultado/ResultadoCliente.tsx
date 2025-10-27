'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Componente Cliente que lee los parámetros de la URL
 * y muestra el estado de la transacción.
 */
export default function ResultadoCompraCliente() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [compraId, setCompraId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Leemos los parámetros que nos envía (el mock de) Webpay
    const token = searchParams.get('token_ws');
    const cId = searchParams.get('compra_id');
    
    // 2. Simulamos la lógica de Webpay
    // En un caso real, Webpay te redirige SIN token si el usuario cancela.
    if (!token && !cId) {
      setStatus('error');
      setErrorMessage(
        'El pago fue cancelado o interrumpido. No se ha realizado ningún cargo.',
      );
      return;
    }

    // 3. SIMULACIÓN DE ÉXITO:
    // Si el token y el ID están presentes, asumimos que el pago fue exitoso
    // (En una app real, aquí llamarías a tu API para *verificar* el token)
    if (token && cId) {
      setStatus('success');
      setCompraId(cId);
    } else {
      // Si faltan datos (no debería pasar con nuestro mock)
      setStatus('error');
      setErrorMessage('Los datos de la transacción son incompletos.');
    }
  }, [searchParams]);

  // --- Renderizado según el estado ---

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-lg border border-lime-400/50 shadow-xl">
        <FaCheckCircle className="text-lime-400 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-gray-300 text-lg mb-2">
          Hemos recibido tu pago exitosamente.
        </p>
        <p className="text-gray-400 mb-6">
          Tu número de orden es: <br />
          <span className="font-mono text-lime-300">{compraId}</span>
        </p>
        <p className="text-gray-400 mb-8">
          Enviaremos una confirmación y tus entradas al correo asociado a tu
          cuenta.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/perfil" // (O /perfil/mis-compras cuando exista)
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

  if (status === 'error') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-lg border border-red-500/50 shadow-xl">
        <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Pago Fallido</h1>
        <p className="text-gray-300 text-lg mb-6">{errorMessage}</p>
        <div className="flex justify-center gap-4">
          <Link
            href="/eventos" // (O de vuelta a la página del evento)
            className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-all"
          >
            Volver a Eventos
          </Link>
        </div>
      </div>
    );
  }

  // (Este estado 'loading' no debería verse,
  // ya que el 'Suspense fallback' lo maneja)
  return null;
}