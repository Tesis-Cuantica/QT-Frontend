import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import {
  BookOpen,
  Layers,
  LogOut,
  Menu,
  X,
  Cpu,
  ClipboardCheck,
} from "lucide-react";
import { useState } from "react";

export default function ProfessorLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItem =
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm";
  const active =
    "bg-gradient-to-r from-fuchsia-700/20 to-blue-700/20 text-purple-300 font-medium border-l-4 border-purple-500";
  const inactive = "hover:bg-zinc-800 text-zinc-400";

  return (
    <div className="min-h-screen flex bg-[#0c0c0d] text-zinc-300">
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#111114] border-r border-zinc-800 flex flex-col transition-transform duration-200`}
      >
        <div className="p-4 border-b border-zinc-800 text-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            QuantumTec — Profesor
          </h1>
          <p className="text-xs text-zinc-500 mt-1">{user?.name}</p>
        </div>

        {/* MENU LATERAL COMPLETO */}
        <nav className="flex-1 p-3 space-y-2">
          <NavLink
            to="/professor"
            end
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            <BookOpen size={18} /> Dashboard
          </NavLink>

          <NavLink
            to="/professor/courses"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            <Layers size={18} /> Mis Cursos
          </NavLink>

          <NavLink
            to="/professor/attempts"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            <ClipboardCheck size={18} /> Intentos de Alumnos
          </NavLink>

          <NavLink
            to="/professor/lab-designer"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            <Cpu size={18} /> Diseñador Cuántico
          </NavLink>

          {/* NUEVA SECCIÓN AÑADIDA */}
          <NavLink
            to="/professor/algorithms"
            className={({ isActive }) =>
              `${navItem} ${isActive ? active : inactive}`
            }
            onClick={() => setIsSidebarOpen(false)}
          >
            <Cpu size={18} /> Algoritmos Cuánticos
          </NavLink>
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden sticky top-0 flex items-center justify-between p-4 bg-[#111114]/80 backdrop-blur-sm border-b border-zinc-800 z-10">
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            QuantumTec
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-zinc-400 hover:text-white transition"
          >
            {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
