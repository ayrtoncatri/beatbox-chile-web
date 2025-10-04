import ReglasWildcard from "@/components/wildcards/ReglasWildcard";
import FormularioWildcard from "@/components/wildcards/FormularioWildcard";
import ListaWildcards from "@/components/wildcards/ListaWildcards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wildcard | Beatbox Chile",
  description: "Regístrate y participa en las competencias de wildcard de Beatbox Chile. Sube tus videos y compite con la comunidad.",
  keywords: ["Beatbox Chile", "wildcard", "competencias", "videos", "eventos beatbox", "Santiago de Chile", "participa"],
};

export default function WildcardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      <ReglasWildcard />
      <FormularioWildcard />
      <ListaWildcards />
    </main>
  );
}
