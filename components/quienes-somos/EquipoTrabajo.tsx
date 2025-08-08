import { FaUsers } from "react-icons/fa";

// Ejemplo equipo
const equipo = [
  { nombre: "Camila Soto", rol: "Producción" },
  { nombre: "Ignacio Vidal", rol: "Comunicación" },
  { nombre: "Lorena Pinto", rol: "RRSS" },
  { nombre: "Matías Torres", rol: "Audiovisual" },
];

export default function EquipoTrabajo() {
  return (
    <section className="mt-12 max-w-3xl mx-auto relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-orange-200 drop-shadow-lg">
        Equipo de Trabajo
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {equipo.map((e, i) => (
          <div
            key={i}
            className="
              bg-gradient-to-br from-orange-100/10 via-amber-200/10 to-white/5
              backdrop-blur-lg border border-orange-200/40 shadow-md
              hover:shadow-amber-400/30 p-6 rounded-2xl flex items-center gap-3
              transition-all duration-300
            "
          >
            <FaUsers className="text-orange-200 text-2xl" />
            <div>
              <h3 className="text-lg font-bold text-white">{e.nombre}</h3>
              <span className="text-orange-100 font-medium">{e.rol}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
