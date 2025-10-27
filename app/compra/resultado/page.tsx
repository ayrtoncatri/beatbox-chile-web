import { Suspense } from 'react';
import ResultadoCompraCliente from '@/components/compra/resultado/ResultadoCliente'; // Importamos el componente cliente

/**
 * Componente de "Carga" simple
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

/**
 * Página (Server Component) que envuelve el componente cliente en Suspense.
 * Esto es necesario para que 'useSearchParams' funcione.
 */
export default function ResultadoCompraPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<LoadingSpinner />}>
        <ResultadoCompraCliente />
      </Suspense>
    </div>
  );
}