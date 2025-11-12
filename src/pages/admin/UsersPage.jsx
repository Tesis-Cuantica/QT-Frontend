import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import UserFormModal from "@/components/admin/UserFormModal";
import Loader from "@/components/common/Loader";
import { Plus, Search } from "lucide-react";

const roleStyles = {
  ADMIN: "bg-purple-500/20 text-purple-300",
  PROFESSOR: "bg-blue-500/20 text-blue-300",
  STUDENT: "bg-green-500/20 text-green-300",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data.data || []);
    } catch (e) {
      console.error(e);
      alert("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch {
      alert("Error al eliminar usuario");
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        if (filterRole && user.role !== filterRole) {
          return false;
        }
        return true;
      })
      .filter((user) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
        );
      });
  }, [users, searchTerm, filterRole]);

  return (
    <div className="bg-[#111114] border border-zinc-800 rounded-lg p-4 md:p-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 md:w-auto"
        >
          <option value="">Todos los roles</option>
          <option value="ADMIN">Admin</option>
          <option value="PROFESSOR">Profesor</option>
          <option value="STUDENT">Estudiante</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[600px] text-sm text-left text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs text-zinc-400 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  ID
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Rol
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-zinc-500">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-100">{u.id}</td>
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {u.name}
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          roleStyles[u.role] || "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-4">
                      <button
                        className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
                        onClick={() => {
                          setEditingUser(u);
                          setModalOpen(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="font-medium text-red-500 hover:text-red-400 transition-colors"
                        onClick={() => handleDelete(u.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
