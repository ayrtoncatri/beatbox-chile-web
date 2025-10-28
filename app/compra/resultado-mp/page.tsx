// app/compra/resultado-mp/page.tsx
import { Suspense } from 'react';
import ResultadoMpCliente from '@/components/compra/resultado/ResultadoMpCliente'; // <-- Importamos el NUEVO componente

/**
 * Componente de "Carga" simple
 * (Puedes moverlo a un archivo 'ui' si lo reutilizas)
 */
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

/**
 * Página (Server Component) que envuelve el componente cliente en Suspense.
 */
export default function ResultadoMpPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<LoadingSpinner />}>
        <ResultadoMpCliente />
      </Suspense>
    </div>
  );
}