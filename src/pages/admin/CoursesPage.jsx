import { useEffect, useState } from "react";
import api from "@/services/api";
import Loader from "@/components/common/Loader";
import CourseFormModal from "@/components/admin/CourseFormModal";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data.data || []);
    } catch {
      alert("Error al cargar cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar curso y su contenido?")) return;
    await api.delete(`/admin/courses/${id}`);
    fetchCourses();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Cursos</h1>
        <button
          className="bg-qt-primary px-3 py-2 rounded font-semibold"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          + Nuevo Curso
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table className="w-full text-sm border border-qt-border">
          <thead className="bg-qt-panel">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Título</th>
              <th className="p-2">Nivel</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Profesor</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr
                key={c.id}
                className="border-t border-qt-border hover:bg-qt-panel/50"
              >
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.title}</td>
                <td className="p-2">{c.level}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2">{c.professor?.name || "—"}</td>
                <td className="p-2 space-x-2">
                  <button
                    className="text-qt-accent"
                    onClick={() => {
                      setEditing(c);
                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="text-qt-danger"
                    onClick={() => handleDelete(c.id)}
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
        <CourseFormModal
          course={editing}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchCourses}
        />
      )}
    </div>
  );
}
