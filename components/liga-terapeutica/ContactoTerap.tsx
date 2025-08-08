import { FaEnvelopeOpenText, FaInstagram } from "react-icons/fa";

export default function ContactoTerap() {
  return (
    <section className="mt-12 max-w-3xl mx-auto relative z-10">
      <h2 className="text-3xl font-bold mb-8 text-cyan-300 drop-shadow-lg flex items-center gap-2">
        <FaEnvelopeOpenText className="text-cyan-300 text-2xl" />
        Contacto
      </h2>
      <div className="
        bg-gradient-to-br from-teal-900/70 via-cyan-900/60 to-emerald-400/20
        backdrop-blur-lg border border-cyan-300/30 shadow-xl
        hover:shadow-emerald-300/20 p-8 rounded-2xl
        text-white font-medium transition-all duration-300
      ">
        Escríbenos a
        <a
          href="mailto:terapeutico@beatboxchile.cl"
          className="ml-2 underline text-emerald-200 hover:text-cyan-200 transition-colors font-bold"
        >
          terapeutico@beatboxchile.cl
        </a>
        {" "}o envíanos tus dudas por Instagram{" "}
        <a
          href="https://instagram.com/beatboxchile"
          className="inline-flex items-center gap-1 underline text-cyan-200 hover:text-emerald-200 transition-colors font-bold"
          target="_blank"
          rel="noopener noreferrer"
        >
          @beatboxchile <FaInstagram className="ml-1 text-cyan-200" />
        </a>
        .
      </div>
    </section>
  );
}
