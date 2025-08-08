import { FaHeartbeat } from "react-icons/fa";

export default function PropositoTerap() {
  return (
    <section className="mt-12 max-w-3xl mx-auto relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-teal-300 drop-shadow-lg flex items-center gap-2">
        <FaHeartbeat className="text-teal-300 text-2xl" />
        Propósito
      </h2>
      <div className="
        bg-gradient-to-br from-teal-900/70 via-cyan-900/60 to-emerald-400/20
        backdrop-blur-lg border border-teal-400/30 shadow-xl
        hover:shadow-emerald-300/20 p-8 rounded-2xl
        text-white font-medium transition-all duration-300
      ">
        La Liga Terapéutica busca promover el bienestar y la inclusión a través del beatbox, entregando espacios seguros de expresión, autocuidado y colaboración.
      </div>
    </section>
  );
}
