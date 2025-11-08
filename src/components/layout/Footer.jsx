export default function Footer() {
  return (
    <footer className="relative border-t border-gray-700 bg-[#0c0c0d] text-gray-400 py-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute w-72 h-72 bg-fuchsia-700/20 rounded-full blur-3xl top-0 left-10"></div>
        <div className="absolute w-72 h-72 bg-indigo-700/20 rounded-full blur-3xl bottom-0 right-10"></div>
      </div>

      <div className="container mx-auto px-4 text-center">
        <p className="text-sm tracking-wide">
          © {new Date().getFullYear()}{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent font-semibold">
            QuantumTec LMS
          </span>{" "}
          — Aprendizaje en Computación Cuántica
        </p>
      </div>
    </footer>
  );
}
