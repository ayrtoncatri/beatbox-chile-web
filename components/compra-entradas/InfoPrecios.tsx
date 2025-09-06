// components/compra-entradas/InfoPrecios.tsx
type Tier = {
    nombre: string;
    precio: number;
    descripcion?: string;
  };
  
  const TIERS: Tier[] = [
    { nombre: "General", precio: 8000, descripcion: "Acceso general al evento." },
    { nombre: "VIP", precio: 15000, descripcion: "Zona preferencial y acceso anticipado." },
  ];
  
  export default function InfoPrecios() {
    return (
      <section className="mt-10 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-lime-300 drop-shadow mb-4 text-center">
          Precios
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TIERS.map((t) => (
            <div
              key={t.nombre}
              className="bg-gradient-to-br from-gray-900/80 via-neutral-900/80 to-lime-400/10
                         backdrop-blur-lg border border-lime-400/20 shadow-2xl
                         p-6 rounded-2xl"
            >
              <h3 className="text-xl font-semibold text-white">{t.nombre}</h3>
              <p className="text-lime-300 text-2xl font-extrabold mt-2">${t.precio.toLocaleString("es-CL")}</p>
              {t.descripcion && (
                <p className="text-lime-100/80 mt-2">{t.descripcion}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }
  