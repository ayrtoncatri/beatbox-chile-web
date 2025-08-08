import { FaTrophy } from "react-icons/fa";

export default function InfoCircuito() {
  return (
    <section className="mt-12 relative z-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-cyan-300 drop-shadow-lg">
        <FaTrophy className="inline-block mr-2 text-cyan-300" />
        Información de Circuito
      </h2>
      <div className="
        bg-gradient-to-br from-blue-900/80 via-blue-900/70 to-cyan-400/10
        backdrop-blur-lg border border-blue-400/30 shadow-xl
        hover:shadow-cyan-400/30 p-8 rounded-2xl
        text-white font-medium transition-all duration-300
      ">
        El circuito nacional reúne a los mejores beatboxers de Chile en un torneo de alto nivel, con fechas clasificatorias en distintas ciudades y una gran final.
      </div>
    </section>
  );
}
