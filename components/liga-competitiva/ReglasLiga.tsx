import { FaGavel } from "react-icons/fa";

export default function ReglasLiga() {
  return (
    <section className="mt-12 relative z-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-cyan-300 drop-shadow-lg">
        <FaGavel className="inline-block mr-2 text-cyan-300" />
        Reglas
      </h2>
      <div className="
        bg-gradient-to-br from-blue-900/80 via-blue-900/70 to-cyan-400/10
        backdrop-blur-lg border border-blue-400/30 shadow-lg
        hover:shadow-cyan-400/30 p-8 rounded-2xl
        transition-all duration-300
      ">
        <ul className="list-disc pl-6 text-blue-100 space-y-2">
          <li>Formato 1 vs 1, rondas eliminatorias.</li>
          <li>Jueces internacionales y nacionales.</li>
          <li>No se permite contenido ofensivo ni discriminatorio.</li>
          <li>El uso de loopstation solo en rondas específicas.</li>
        </ul>
      </div>
    </section>
  );
}
