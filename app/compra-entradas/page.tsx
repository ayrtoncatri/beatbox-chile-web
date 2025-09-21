import InfoPrecios from "@/components/compra-entradas/InfoPrecios";
import CompraEntradasClient from "@/components/compra-entradas/CompraEntradasClient";
import EventosDisponibles from "@/components/compra-entradas/EventosDisponibles";

export default function CompraEntradasPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <InfoPrecios />
        <CompraEntradasClient />
      </div>
    </main>
  );
}
