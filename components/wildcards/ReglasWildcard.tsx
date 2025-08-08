import { FaCheckCircle } from "react-icons/fa";

export default function ReglasWildcard() {
  return (
    <section className="mt-12 relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-lime-300 drop-shadow-lg">
        Reglas del Evento y Wildcard
      </h2>
      <div className="
        bg-gradient-to-br from-gray-900/80 via-neutral-900/80 to-lime-400/10
        backdrop-blur-lg border border-lime-400/20 shadow-2xl
        hover:shadow-lime-500/40 p-8 rounded-2xl
        transition-all duration-400
      ">
        <ul className="list-disc pl-7 text-lime-100 text-lg space-y-3">
          <li className="flex items-center gap-2">
            <FaCheckCircle className="text-lime-400" />
            El video debe estar subido a YouTube en modo público o no listado.
          </li>
          <li className="flex items-center gap-2">
            <FaCheckCircle className="text-lime-400" />
            Duración máxima: <span className="font-bold text-white">2 minutos</span>.
          </li>
        </ul>
      </div>
    </section>
  );
}
