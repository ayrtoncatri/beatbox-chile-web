import { FaMedal } from "react-icons/fa";

// Simula clasificados
const clasificados = [
  { nombre: "Beatmaster", ciudad: "Santiago" },
  { nombre: "Bass Queen", ciudad: "Valparaíso" },
];

export default function Clasificados() {
  return (
    <section className="mt-12 relative z-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-cyan-300 drop-shadow-lg">
        Clasificados
      </h2>
      <div className="
        bg-gradient-to-br from-blue-900/80 via-blue-900/70 to-cyan-400/10
        backdrop-blur-lg border border-blue-400/30 shadow-lg
        hover:shadow-cyan-400/40 p-8 rounded-2xl transition-all duration-300
      ">
        <div className="flex flex-wrap gap-8">
          {clasificados.map((c, i) => (
            <div key={i} className="flex flex-col items-start gap-2 min-w-[150px]">
              <div className="flex items-center gap-2">
                <FaMedal className="text-yellow-400 text-lg" />
                <span className="text-white font-extrabold text-lg">{c.nombre}</span>
              </div>
              <span className="text-blue-200 font-medium text-sm ml-7">— {c.ciudad}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
