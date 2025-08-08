import { FaEnvelope } from "react-icons/fa";

export default function Contacto() {
  return (
    <section className="mt-12 max-w-xl mx-auto relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-amber-300 drop-shadow-lg">
        Contacto
      </h2>
      <div className="
        bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-white/5
        backdrop-blur-lg border border-amber-300/30 shadow-xl
        hover:shadow-amber-300/30 p-8 rounded-2xl flex flex-col gap-5
        transition-all duration-300
      ">
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-amber-300 text-xl" />
          <span className="text-lg text-white font-semibold">¿Quieres hablar con nosotros?</span>
        </div>
        <p className="text-gray-100">
          Puedes escribirnos a nuestro correo oficial:{" "}
          <a
            href="mailto:contacto@beatboxchile.cl"
            className="underline text-orange-200 hover:text-amber-400 transition-colors"
          >
            contacto@beatboxchile.cl
          </a>
        </p>
      </div>
    </section>
  );
}
