const eventos = [
  { nombre: "Liga Nacional 2024", fecha: "2024-09-10", lugar: "Santiago" },
  { nombre: "Liga Terapéutica 2024", fecha: "2024-06-22", lugar: "Concepción" },
];

export default function EventosList() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-blue-100 mb-4">Eventos Pasados</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {eventos.map((ev, i) => (
          <div key={i} className="bg-neutral-900 rounded-xl p-4 shadow">
            <h3 className="text-lg text-white font-semibold">{ev.nombre}</h3>
            <p className="text-blue-200">{ev.fecha} — {ev.lugar}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
