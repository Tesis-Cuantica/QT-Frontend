import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import Loader from "@/components/common/Loader";
import CourseFormModal from "@/components/admin/CourseFormModal";
import { Plus, Search } from "lucide-react";

const statusStyles = {
  ACTIVE: "bg-green-500/20 text-green-300",
  INACTIVE: "bg-zinc-500/20 text-zinc-300",
  DRAFT: "bg-yellow-500/20 text-yellow-300",
};

const levelStyles = {
  Básico: "bg-blue-500/20 text-blue-300",
  Intermedio: "bg-yellow-500/20 text-yellow-300",
  Avanzado: "bg-red-500/20 text-red-300",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
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
    if (!confirm("¿Eliminar curso y todo su contenido asociado?")) return;
    try {
      await api.delete(`/admin/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert("Error al eliminar el curso.");
    }
  };

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (filterLevel && course.level !== filterLevel) return false;
        if (filterStatus && course.status !== filterStatus) return false;
        return true;
      })
      .filter((course) => {
        if (!searchTerm) return true;
        return course.title.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [courses, searchTerm, filterLevel, filterStatus]);

  return (
    <div className="bg-[#111114] border border-zinc-800 rounded-lg p-4 md:p-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> Nuevo Curso
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por título..."
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
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 md:w-auto"
        >
          <option value="">Todo Nivel</option>
          <option value="Básico">Básico</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 md:w-auto"
        >
          <option value="">Todo Estado</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
          <option value="DRAFT">Borrador</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[700px] text-sm text-left text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs text-zinc-400 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  ID
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Título
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Nivel
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Profesor
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-zinc-500">
                    No se encontraron cursos.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-100">{c.id}</td>
                    <td className="px-4 py-3 font-medium text-zinc-100">
                      {c.title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          levelStyles[c.level] || "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {c.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusStyles[c.status] || "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{c.professor?.name || "—"}</td>
                    <td className="px-4 py-3 space-x-4">
                      <button
                        className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
                        onClick={() => {
                          setEditing(c);
                          setModalOpen(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="font-medium text-red-500 hover:text-red-400 transition-colors"
                        onClick={() => handleDelete(c.id)}
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
        <CourseFormModal
          course={editing}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            fetchCourses();
          }}
        />
      )}
    </div>
  );
}
