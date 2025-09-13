import HomeTienda from "@/components/tienda/HomeTienda";

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