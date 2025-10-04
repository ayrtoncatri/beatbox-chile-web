import Directiva from "@/components/quienes-somos/Directiva";
import EquipoTrabajo from "@/components/quienes-somos/EquipoTrabajo";
import Contacto from "@/components/quienes-somos/Contacto";
import BuzonIdeas from "@/components/quienes-somos/BuzonIdeas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiénes Somos | Beatbox Chile",
  description: "Conoce la directiva, el equipo de trabajo y la historia de Beatbox Chile. Contáctanos o envía tus ideas a nuestra comunidad.",
  keywords: ["Beatbox Chile", "equipo", "directiva", "quiénes somos", "comunidad", "contacto", "ideas"],
};

export default function QuienesSomosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      <Directiva />
      <EquipoTrabajo />
      <Contacto />
      <BuzonIdeas />
    </main>
  );
}
