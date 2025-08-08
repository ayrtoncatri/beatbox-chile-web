import { FaUserTie } from "react-icons/fa";

// Ejemplo de directiva
const directiva = [
  { nombre: "Javiera Ríos", cargo: "Presidenta" },
  { nombre: "Daniel López", cargo: "Vicepresidente" },
  { nombre: "Fernanda Ruiz", cargo: "Secretaria" },
  { nombre: "Carlos Ortega", cargo: "Tesorero" },
];

export default function Directiva() {
  return (
    <section className="mt-12 max-w-3xl mx-auto relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-amber-300 drop-shadow-lg">
        Directiva
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {directiva.map((p, i) => (
          <div
            key={i}
            className="
              bg-gradient-to-br from-yellow-200/10 via-amber-200/10 to-orange-200/10
              backdrop-blur-lg border border-amber-300/40 shadow-lg
              hover:shadow-amber-400/40 p-6 rounded-2xl flex items-center gap-3
              transition-all duration-300
            "
          >
            <FaUserTie className="text-amber-300 text-2xl" />
            <div>
              <h3 className="text-xl font-bold text-white">{p.nombre}</h3>
              <span className="text-amber-200 font-medium">{p.cargo}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
