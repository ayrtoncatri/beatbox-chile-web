const sponsors = [
  { nombre: "Microfono Pro", img: "/logo.png" }, // Cambia a tu logo real
  { nombre: "Urban Beats", img: "/logo.png" },
];

export default function Colaboradores() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-blue-100 mb-3">Colaboradores y Sponsors</h2>
      <div className="flex gap-6 flex-wrap items-center bg-neutral-900 rounded-xl p-6 shadow">
        {sponsors.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            <img src={s.img} alt={s.nombre} className="w-20 h-20 object-contain mb-2 rounded-full bg-white" />
            <span className="text-blue-200 font-semibold">{s.nombre}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
