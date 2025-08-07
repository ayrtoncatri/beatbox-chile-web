const clasificados = [
  { nombre: "Beatmaster", ciudad: "Santiago" },
  { nombre: "Bass Queen", ciudad: "Valparaíso" },
];

export default function Clasificados() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-blue-100 mb-3">Clasificados</h2>
      <div className="bg-neutral-900 rounded-xl p-6 shadow text-white">
        <ul className="grid md:grid-cols-2 gap-4">
          {clasificados.map((c, i) => (
            <li key={i} className="border-b border-blue-800 pb-2 mb-2">
              <span className="font-semibold">{c.nombre}</span> — {c.ciudad}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
