
import Banner from "@/components/home/Banner";
import Anuncios from "@/components/home/Anuncios";
import NoticiasList from "@/components/home/NoticiasList";
import AuthButtons from "@/components/home/AuthButtons";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-blue-950 to-neutral-900 py-6 px-4">
      <Banner />
      <Anuncios />
      <NoticiasList />
      <AuthButtons />
    </main>
  );
}
