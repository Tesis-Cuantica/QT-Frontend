import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { LogOut, Users, BookOpen, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItem =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800 transition-colors text-sm";
  const active =
    "bg-gradient-to-r from-purple-700/30 to-blue-700/30 text-white font-medium";

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            QuantumTec — Admin
          </h1>
          <p className="text-xs text-zinc-500 mt-1">{user?.email}</p>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-zinc-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `${navItem} ${isActive ? active : "text-zinc-400"}`
          }
          onClick={() => setIsSidebarOpen(false)}
        >
          <BarChart3 size={18} /> Reportes
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `${navItem} ${isActive ? active : "text-zinc-400"}`
          }
          onClick={() => setIsSidebarOpen(false)}
        >
          <Users size={18} /> Usuarios
        </NavLink>

        <NavLink
          to="/admin/courses"
          className={({ isActive }) =>
            `${navItem} ${isActive ? active : "text-zinc-400"}`
          }
          onClick={() => setIsSidebarOpen(false)}
        >
          <BookOpen size={18} /> Cursos
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
    </>
  );

  return (
    <div className="relative min-h-screen md:flex bg-[#0c0c0d] text-zinc-300">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#111114] border-r border-zinc-800 flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex`}
      >
        <SidebarContent />
      </aside>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
        />
      )}

      <main className="flex-1 md:ml-64">
        <header className="md:hidden sticky top-0 flex items-center justify-between p-4 bg-[#111114]/80 backdrop-blur-sm border-b border-zinc-800 z-10">
          <h1 className="text-lg font-bold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            QuantumTec
          </h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-zinc-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
