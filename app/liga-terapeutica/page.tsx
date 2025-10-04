import PropositoTerap from "@/components/liga-terapeutica/PropositoTerap";
import RegistroTerap from "@/components/liga-terapeutica/RegistroTerap";
import ContactoTerap from "@/components/liga-terapeutica/ContactoTerap";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liga Terapéutica | Beatbox Chile",
  description: "Explora la liga terapéutica de Beatbox Chile. Participa en eventos inclusivos y disfruta del beatbox de manera recreativa.",
  keywords: ["Beatbox Chile", "liga terapéutica", "competencias", "eventos inclusivos", "beatbox", "participa"],
};

export default function LigaTerapeuticaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      <h1 className="text-3xl font-extrabold text-blue-100 mb-8 text-center">
        Liga Terapéutica
      </h1>
      <PropositoTerap />
      <RegistroTerap />
      <ContactoTerap />
    </main>
  );
}
