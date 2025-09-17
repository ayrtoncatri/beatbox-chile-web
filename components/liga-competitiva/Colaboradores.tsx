import { FaHandshake } from "react-icons/fa";
import Image from "next/image";

// Simula colaboradores/sponsors
const colaboradores = [
  { nombre: "Microfono Pro", logo: "/logos/microfono-pro.png" },
  { nombre: "Urban Beats", logo: "/logos/urban-beats.png" },
];

export default function Colaboradores() {
  return (
    <section className="mt-12 relative z-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-cyan-300 drop-shadow-lg">
        <FaHandshake className="inline-block mr-2 text-cyan-300" />
        Colaboradores y Sponsors
      </h2>
      <div className="
        bg-gradient-to-br from-blue-900/80 via-blue-900/70 to-cyan-400/10
        backdrop-blur-lg border border-blue-400/30 shadow-lg
        hover:shadow-cyan-400/30 p-8 rounded-2xl
        flex flex-wrap gap-8 items-center
        transition-all duration-300
      ">
        {colaboradores.map((col, i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[120px]">
            {/* Logo circular */}
            <div className="
              bg-white/10 border border-blue-400/40 rounded-full flex items-center justify-center w-20 h-20
              shadow-md overflow-hidden mb-2
              ">
              {col.logo
                ? <Image src={col.logo} alt={col.nombre} width={64} height={64} className="object-contain w-16 h-16" />
                : <span className="text-white">{col.nombre[0]}</span>
              }
            </div>
            <span className="text-white font-bold text-center">{col.nombre}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
