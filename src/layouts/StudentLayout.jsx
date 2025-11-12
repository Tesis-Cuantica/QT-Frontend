import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import {
  BookOpen,
  Layers,
  LogOut,
  Menu,
  X,
  FlaskConical,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

export default function StudentLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItem =
    "flex items-center gap-2 px-3 py-2 rounded transition-all duration-200";
  const active =
    "bg-gradient-to-r from-fuchsia-700/20 to-blue-700/20 text-purple-400 border-l-4 border-purple-500";
  const inactive = "hover:bg-gray-800 text-gray-400";

  return (
    <div className="min-h-screen flex bg-[#0c0c0d] text-gray-300">
      {/* Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#111114] border-r border-gray-800 flex flex-col transition-transform duration-200`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 text-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            QuantumTec — Estudiante
          </h1>
          <p className="text-xs text-gray-500 mt-1">{user?.name}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <BookOpen size={16} /> Dashboard
          </NavLink>

          <NavLink
            to="/student/courses"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <Layers size={16} /> Mis Cursos
          </NavLink>

          <NavLink
            to="/student/attempts"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <ClipboardList size={16} /> Intentos
          </NavLink>

          <NavLink
            to="/student/reports"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <BarChart3 size={16} /> Reportes
          </NavLink>

          <NavLink
            to="/student/labs"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
          >
            <FlaskConical size={16} /> Laboratorios
          </NavLink>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-4 border-t border-gray-800 hover:bg-gray-900 text-red-400 text-sm font-medium"
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar (mobile only) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-[#0c0c0d]">
          <h2 className="text-white font-semibold">Panel del Estudiante</h2>
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-300 hover:text-white transition"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        {/* Dynamic outlet */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
