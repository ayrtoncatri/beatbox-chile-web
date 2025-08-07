const noticias = [
  {
    title: "Nuevo Torneo Nacional 2025",
    excerpt: "¡Ya están abiertas las inscripciones para el torneo más grande del año!",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "Campeón GBB visita Chile",
    excerpt: "Un invitado internacional dará workshop exclusivo a la comunidad.",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80"
  },
];

export default function NoticiasList() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-blue-100 mb-4">Últimas Noticias</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {noticias.map((n, i) => (
          <div key={i} className="bg-neutral-900 rounded-xl shadow-md overflow-hidden">
            <img src={n.img} alt={n.title} className="h-44 w-full object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white">{n.title}</h3>
              <p className="text-blue-200">{n.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
