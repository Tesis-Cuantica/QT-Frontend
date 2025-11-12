import { useForm } from "react-hook-form";
import api from "@/services/api";
import { useEffect, useState } from "react";

export default function CourseFormModal({ course, onClose, onSuccess }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: course || {
      title: "",
      description: "",
      level: "BASIC",
      status: "ACTIVE",
      professorId: "",
    },
  });

  const [professors, setProfessors] = useState([]);

  // Cargar profesores
  useEffect(() => {
    const fetchProfs = async () => {
      try {
        const res = await api.get("/admin/users");
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setProfessors(list.filter((u) => u.role === "PROFESSOR"));
      } catch (err) {
        console.error("Error cargando profesores", err);
        setProfessors([]);
      }
    };
    fetchProfs();
  }, []);

  // Reset cuando se edita
  useEffect(() => {
    reset(course);
  }, [course, reset]);

  // Enviar al backend
  const onSubmit = async (values) => {
    try {
      // Normalizar los tipos de datos
      const payload = {
        title: values.title.trim(),
        description: values.description || "",
        level: values.level,
        status: values.status,
      };

      if (values.professorId) payload.professorId = Number(values.professorId);

      // Si es edición o creación
      if (course) {
        await api.patch(`/admin/courses/${course.id}`, payload);
        alert("Curso actualizado correctamente");
      } else {
        await api.post("/admin/courses", payload);
        alert("Curso creado correctamente");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al guardar curso:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error desconocido al guardar curso";
      alert(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-qt-panel border border-qt-border p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {course ? "Editar Curso" : "Nuevo Curso"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("title", { required: true })}
            placeholder="Título del curso"
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          />
          <textarea
            {...register("description")}
            placeholder="Descripción"
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          />
          <select
            {...register("level")}
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          >
            <option value="BASIC">BASIC</option>
            <option value="INTERMEDIATE">INTERMEDIATE</option>
            <option value="ADVANCED">ADVANCED</option>
          </select>
          <select
            {...register("status")}
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <select
            {...register("professorId")}
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          >
            <option value="">Asignar Profesor</option>
            {professors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-qt-muted hover:text-white"
            >
              Cancelar
            </button>
            <button className="bg-qt-primary px-4 py-1 rounded hover:opacity-90">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
