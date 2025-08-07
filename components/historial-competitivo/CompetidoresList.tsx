const competidores = [
  { nombre: "Beatmaster", logros: "Ganador 2023, Finalista 2024" },
  { nombre: "Vocalizer", logros: "Top 8 Nacional 2024" },
];

export default function CompetidoresList() {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-blue-100 mb-4">Competidores Destacados</h2>
      <ul className="space-y-3">
        {competidores.map((c, i) => (
          <li key={i} className="bg-neutral-900 rounded-lg p-3 shadow text-white">
            <strong>{c.nombre}:</strong> <span className="text-blue-200">{c.logros}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
