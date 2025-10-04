import HomeTienda from "@/components/tienda/HomeTienda";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda | Beatbox Chile",
  description: "Compra productos oficiales de Beatbox Chile. Camisetas, gorras, stickers y más.",
  keywords: ["Beatbox Chile", "tienda", "productos", "camisetas", "gorras", "stickers"],
};


export default function TiendaPage() {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
        <h1 className="text-3xl font-extrabold text-blue-100 mb-8 text-center">
          Tienda
        </h1>
        <HomeTienda />
      </main>
    );
  }