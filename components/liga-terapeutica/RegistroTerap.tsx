import { FaClipboardCheck } from "react-icons/fa";

export default function RegistroTerap() {
  return (
    <section className="mt-12 max-w-3xl mx-auto relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-emerald-300 drop-shadow-lg flex items-center gap-2">
        <FaClipboardCheck className="text-emerald-300 text-2xl" />
        Registro
      </h2>
      <div className="
        bg-gradient-to-br from-teal-900/70 via-cyan-900/60 to-emerald-400/20
        backdrop-blur-lg border border-emerald-400/30 shadow-xl
        hover:shadow-emerald-300/20 p-8 rounded-2xl
        text-white font-medium transition-all duration-300
      ">
        ¿Te interesa participar? Pronto abriremos inscripciones para nuevos ciclos de talleres y encuentros terapéuticos de beatbox.
      </div>
    </section>
  );
}
