export default function AuthButtons() {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow transition">
        Iniciar Sesión
      </button>
      <button className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-lg shadow border border-blue-900 transition hover:bg-blue-100">
        Registrarse
      </button>
    </div>
  );
}
