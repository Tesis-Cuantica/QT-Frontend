import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { LogOut, Users, BookOpen, BarChart3, Layers } from "lucide-react";

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItem =
    "flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-800 transition text-sm";
  const active =
    "bg-gradient-to-r from-purple-700/20 to-blue-700/20 border-l-4 border-purple-500 text-white";

  return (
    <div className="min-h-screen flex bg-[#0c0c0d] text-gray-300">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111114] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            QuantumTec — Admin
          </h1>
          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : "text-gray-400"}`
            }
          >
            <BarChart3 size={16} /> Reportes
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : "text-gray-400"}`
            }
          >
            <Users size={16} /> Usuarios
          </NavLink>

          <NavLink
            to="/admin/courses"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : "text-gray-400"}`
            }
          >
            <BookOpen size={16} /> Mis Cursos
          </NavLink>

          <NavLink
            to="/admin/modules"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : "text-gray-400"}`
            }
          >
            <Layers size={16} /> Módulos
          </NavLink>
        </nav>

        <div className="p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 px-3 py-2 rounded hover:bg-red-500/20 transition text-sm"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
