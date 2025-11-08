import { useEffect, useState } from "react";
import api from "../../services/api";
import { motion as Motion } from "framer-motion";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data);
  };

  const updateRole = async (id, role) => {
    setLoading(true);
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      fetchUsers();
    } catch {
      alert("Error al actualizar rol");
    }
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch {
      alert("No se puede eliminar: tiene datos asociados.");
    }
  };

  const roleColors = {
    STUDENT: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    PROFESSOR: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    ADMIN: "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30",
  };

  return (
    <div className="space-y-8 text-gray-200">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-gray-500">Total: {users.length} usuarios</p>
      </div>

      {/* Tabla de usuarios */}
      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#121217] p-6 rounded-xl border border-gray-800 shadow-lg overflow-x-auto"
      >
        <table className="min-w-full text-left text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-400 uppercase text-xs tracking-wide">
              <th className="pb-3 px-3">Nombre</th>
              <th className="pb-3 px-3">Correo</th>
              <th className="pb-3 px-3">Rol</th>
              <th className="pb-3 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <Motion.tr
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`${
                  i % 2 === 0 ? "bg-[#141418]" : "bg-[#18181d]"
                } hover:bg-[#1f1f27] transition rounded-lg`}
              >
                <td className="py-3 px-3 rounded-l-lg">{user.name}</td>
                <td className="py-3 px-3 text-gray-400">{user.email}</td>
                <td className="py-3 px-3">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    disabled={loading}
                    className={`rounded-lg px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-transparent ${
                      roleColors[user.role]
                    }`}
                  >
                    <option
                      value="STUDENT"
                      className="bg-gray-900 text-blue-400"
                    >
                      Estudiante
                    </option>
                    <option
                      value="PROFESSOR"
                      className="bg-gray-900 text-purple-400"
                    >
                      Profesor
                    </option>
                    <option
                      value="ADMIN"
                      className="bg-gray-900 text-fuchsia-400"
                    >
                      Admin
                    </option>
                  </select>
                </td>
                <td className="py-3 px-3 text-center rounded-r-lg">
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={loading}
                    className="text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 px-3 py-1 rounded-lg text-xs transition-all"
                  >
                    Eliminar
                  </button>
                </td>
              </Motion.tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No hay usuarios registrados.
          </div>
        )}
      </Motion.div>
    </div>
  );
}
