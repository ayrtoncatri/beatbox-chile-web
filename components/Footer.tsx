export default function Footer() {
  return (
    <footer className="w-full py-4 bg-neutral-950 bg-opacity-90 mt-12">
      <div className="max-w-4xl mx-auto px-4 text-center text-blue-200 text-sm">
        © {new Date().getFullYear()} Beatbox Chile · Comunidad, cultura y competencia.
      </div>
    </footer>
  );
}
