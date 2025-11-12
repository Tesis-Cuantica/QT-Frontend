import { useForm } from "react-hook-form";
import api from "@/services/api";

export default function UserFormModal({ user, onClose, onSuccess }) {
  const { register, handleSubmit } = useForm({
    defaultValues: user || {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  const onSubmit = async (values) => {
    try {
      if (user) {
        await api.patch(`/admin/users/${user.id}/role`, { role: values.role });
        alert("Rol actualizado");
      } else {
        await api.post("/admin/users", values);
        alert("Usuario creado");
      }
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Error al guardar usuario");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-qt-panel border border-qt-border p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {user ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!user && (
            <>
              <input
                {...register("name", { required: true })}
                placeholder="Nombre"
                className="w-full p-2 rounded bg-transparent border border-qt-border"
              />
              <input
                {...register("email", { required: true })}
                placeholder="Correo"
                type="email"
                className="w-full p-2 rounded bg-transparent border border-qt-border"
              />
              <input
                {...register("password", { required: true })}
                placeholder="Contraseña"
                type="password"
                className="w-full p-2 rounded bg-transparent border border-qt-border"
              />
            </>
          )}
          <select
            {...register("role")}
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          >
            <option value="STUDENT">STUDENT</option>
            <option value="PROFESSOR">PROFESSOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="text-qt-muted">
              Cancelar
            </button>
            <button className="bg-qt-primary px-3 py-1 rounded">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
