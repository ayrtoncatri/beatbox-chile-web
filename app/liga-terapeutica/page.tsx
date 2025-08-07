import PropositoTerap from "@/components/liga-terapeutica/PropositoTerap";
import RegistroTerap from "@/components/liga-terapeutica/RegistroTerap";
import ContactoTerap from "@/components/liga-terapeutica/ContactoTerap";

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
