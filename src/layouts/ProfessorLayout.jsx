import { Outlet, Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function ProfessorLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white shadow dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/professor"
                className="text-xl font-bold text-blue-600 dark:text-blue-400"
              >
                QuantumTec — Profesor
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-200 hidden md:inline">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
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
        <aside className="w-64 bg-white dark:bg-gray-800 shadow h-full">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/professor"
                  className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Mis Cursos
                </Link>
              </li>
              <li>
                <Link
                  to="/professor/pending"
                  className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Calificar Exámenes
                </Link>
              </li>
              {/* Agrega más secciones según avances */}
            </ul>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} QuantumTec LMS — Panel del Profesor
        </div>
      </footer>
    </div>
  );
}
