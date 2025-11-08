import { Outlet, Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import Footer from "../components/layout/Footer";

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0c0d] text-gray-300">
      {/* Navbar */}
      <nav className="relative bg-[#111114] border-b border-gray-800 shadow-md">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-fuchsia-700/10 via-purple-700/10 to-blue-700/10 blur-2xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              to="/admin"
              className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent"
            >
              QuantumTec — Admin
            </Link>

            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-gray-400">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Contenido */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#121217] border-r border-gray-800">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin"
                  className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-purple-500/10 hover:to-blue-500/10 hover:text-white transition-all"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-purple-500/10 hover:to-blue-500/10 hover:text-white transition-all"
                >
                  Gestión de Usuarios
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/courses"
                  className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-purple-500/10 hover:to-blue-500/10 hover:text-white transition-all"
                >
                  Gestión de Cursos
                </Link>
              </li>
              {/* Puedes agregar más secciones aquí */}
            </ul>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6 bg-[#0c0c0d]">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
