import { useEffect, useState } from "react";
import api from "@/services/api";
import UserFormModal from "@/components/admin/UserFormModal";
import Loader from "@/components/common/Loader";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Usuarios</h1>
        <button
          onClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          className="bg-qt-primary px-3 py-2 rounded font-semibold"
        >
          + Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table className="w-full text-sm border border-qt-border">
          <thead className="bg-qt-panel border-b border-qt-border">
            <tr className="text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Email</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-qt-border hover:bg-qt-panel/50"
              >
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="text-qt-accent"
                    onClick={() => {
                      setEditingUser(u);
                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-qt-danger"
                    onClick={() => handleDelete(u.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
