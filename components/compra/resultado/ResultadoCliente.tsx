'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

/**
 * Componente de "Carga" (movido desde page.tsx)
 * Se mostrará mientras se verifica el token.
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[50vh]">
      <div
        className="w-16 h-16 rounded-full animate-spin
                   border-8 border-solid border-lime-400 border-t-transparent"
      ></div>
      <p className="mt-4 text-white text-xl">
        Verificando información del pago...
      </p>
    </div>
  );
}

// (Función helper para formatear a CLP)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};

/**
 * Componente Cliente que lee los parámetros de la URL REALES,
 * llama a la API de confirmación y muestra el estado.
 */
export default function ResultadoCompraCliente() {
  const searchParams = useSearchParams();

  // Estados actualizados para manejar el flujo real
  const [status, setStatus] = useState<
    'loading' | 'success' | 'failed' | 'cancelled'
  >('loading');
  
  // Usaremos un estado más completo para los datos de éxito
  const [compraData, setCompraData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Leemos los parámetros REALES de Webpay
    const token_ws = searchParams.get('token_ws');
    const tbk_token = searchParams.get('TBK_TOKEN'); // Token de anulación/cancelación

    // --- LÓGICA DE CONFIRMACIÓN REAL ---

    // Escenario 1: Pago CANCELADO por el usuario
    if (tbk_token && !token_ws) {
      setStatus('cancelled');
      setErrorMessage(
        'El pago fue cancelado o abortado antes de finalizar. No se ha realizado ningún cargo.',
      );
      return; // No hay nada que confirmar
    }

    // Escenario 2: Pago (aparentemente) EXITOSO, debemos confirmar
    if (token_ws) {
      const confirmarPago = async () => {
        try {
          // 2. Llamamos a nuestra API de backend
          const response = await fetch('/api/compra/confirmar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token_ws }),
          });

          const data = await response.json();

          if (!response.ok) {
            // Error de nuestra API (500, 404, etc.)
            throw new Error(data.error || 'No se pudo confirmar la compra.');
          }

          if (data.status === 'success') {
            // ¡Éxito!
            setStatus('success');
            setCompraData(data); // Guardamos los datos para mostrarlos
          } else {
            // Pago fallido (rechazado por banco, etc.)
            setStatus('failed');
            setErrorMessage(data.error || 'El pago fue rechazado o falló.');
          }
        } catch (err: any) {
          // Error de red o en el fetch
          setStatus('failed');
          setErrorMessage(err.message || 'Error de conexión al confirmar el pago.');
        }
      };

      confirmarPago();
      
    } else {
      // Escenario 3: URL inválida (ni token_ws ni tbk_token)
      setStatus('failed');
      setErrorMessage('Los datos de la transacción son incompletos o inválidos.');
    }
  }, [searchParams]);

  // --- Renderizado según el estado ---

  // Estado 1: Cargando (mientras se ejecuta el useEffect/fetch)
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  // Estado 2: Éxito (Usando tu UI existente)
  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-lg border border-lime-400/50 shadow-xl">
        <FaCheckCircle className="text-lime-400 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          Hemos recibido tu pago exitosamente.
        </p>

        {/* Bloque de datos mejorado */}
        {compraData && (
          <div className="text-left bg-gray-800 p-4 rounded-md mb-8 w-full max-w-md mx-auto">
            <p className="text-gray-300">
              <span className="font-semibold text-lime-300">Monto Pagado:</span>{' '}
              {formatCurrency(compraData.amount)}
            </p>
            <p className="text-gray-300 mt-2">
              <span className="font-semibold text-lime-300">ID de Compra:</span>{' '}
              <span className="font-mono">{compraData.compraId}</span>
            </p>
            <p className="text-gray-300 mt-2">
              <span className="font-semibold text-lime-300">Tarjeta:</span> ****
              **** **** {compraData.lastCardDigits}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <Link
            href="/perfil/compras" // Ruta actualizada
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

  // Estado 3: Cancelado (Reutilizamos tu UI de error pero con color amarillo)
  if (status === 'cancelled') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-lg border border-yellow-500/50 shadow-xl">
        <FaExclamationTriangle className="text-yellow-500 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Compra Cancelada</h1>
        <p className="text-gray-300 text-lg mb-6">{errorMessage}</p>
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

  // Estado 4: Fallido (Usando tu UI de error existente)
  if (status === 'failed') {
    return (
      <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-lg border border-red-500/50 shadow-xl">
        <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">Pago Fallido</h1>
        <p className="text-gray-300 text-lg mb-6">{errorMessage}</p>
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