import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { ROLES } from "../../utils/roles";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case ROLES.STUDENT:
        return [
          { label: "Cursos", path: "/student/courses" },
          { label: "Progreso", path: "/student/progress" },
        ];
      case ROLES.PROFESSOR:
        return [
          { label: "Mis Cursos", path: "/professor/courses" },
          { label: "Exámenes", path: "/professor/exams" },
        ];
      case ROLES.ADMIN:
        return [
          { label: "Usuarios", path: "/admin/users" },
          { label: "Reportes", path: "/admin/reports" },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-white shadow dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-blue-600 dark:text-blue-400"
            >
              QuantumTec
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-700 dark:text-gray-200 hidden md:inline">
                  {user.name}
                </span>
                <div className="flex space-x-2">
                  {getNavLinks().map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
