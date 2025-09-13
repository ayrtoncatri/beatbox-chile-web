import ReglasWildcard from "@/components/wildcards/ReglasWildcard";
import FormularioWildcard from "@/components/wildcards/FormularioWildcard";
import ListaWildcards from "@/components/wildcards/ListaWildcards";

export default function WildcardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-8 px-4">
      <ReglasWildcard />
      <FormularioWildcard />
      <ListaWildcards />
    </main>
  );
}
