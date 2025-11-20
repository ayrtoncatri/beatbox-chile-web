import Image from "next/image";

const noticias = [
  {
    title: "Clasificados Categoria Solo",
    excerpt: "¡Ya están los clasificados para la categoria solo!",
    img: "clasificados-solo.webp"
  },
  {
    title: "Clasificados Categoria Tag Team",
    excerpt: "¡Ya están los clasificados para la categoria Tag Team!",
    img: "clasificados-tagteam.webp"
  },
];

export default function NoticiasList() {
  return (
    <section>
      <h2 className="text-2xl font-bold text-blue-100 mb-4">Últimas Noticias</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {noticias.map((n, i) => (
          <div key={i} className="bg-neutral-900 rounded-xl shadow-md overflow-hidden">
            <Image
              src={`/${n.img}`}
              alt={n.title}
              width={600}
              height={340}
              className="w-full object-cover"
            />
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
