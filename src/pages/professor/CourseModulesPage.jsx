import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import {
  Plus,
  BookOpen,
  FlaskConical,
  ClipboardList,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import ModuleFormModal from "@/components/professor/ModuleFormModal";

export default function CourseModulesPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchModules = async () => {
    try {
      const res = await api.get(`/modules/courses/${courseId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setModules(data);
    } catch {
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar módulo permanentemente?")) return;
    try {
      await api.delete(`/modules/${id}`);
      fetchModules();
    } catch {}
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Cargando módulos...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Módulos del Curso</h1>
          <p className="text-sm text-gray-400">
            Administra los módulos, sus lecciones, laboratorios y exámenes.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedModule(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-qt-primary px-4 py-2 rounded text-black font-semibold hover:opacity-90"
        >
          <Plus size={16} /> Nuevo módulo
        </button>
      </div>

      {modules.length === 0 ? (
        <p className="text-gray-400 text-center mt-12">
          No hay módulos creados para este curso.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((m) => (
            <div
              key={m.id}
              className="bg-[#111114] border border-gray-800 rounded-xl p-5 hover:border-qt-primary/40 transition shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">
                    {m.title}
                  </h2>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {m.description || "Sin descripción"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedModule(m);
                      setModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-qt-primary"
                  >
                    <Edit size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>Orden:</span>
                <span className="font-semibold text-gray-300">
                  {m.order ?? "-"}
                </span>
              </div>

              <div className="flex justify-between gap-2 mt-4">
                <button
                  onClick={() => navigate(`/professor/modules/${m.id}/lessons`)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-700 rounded py-2 hover:bg-gray-800 text-gray-300 text-sm"
                >
                  <BookOpen size={16} /> Lecciones
                </button>
                <button
                  onClick={() => navigate(`/professor/modules/${m.id}/labs`)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-700 rounded py-2 hover:bg-gray-800 text-gray-300 text-sm"
                >
                  <FlaskConical size={16} /> Labs
                </button>
                <button
                  onClick={() => navigate(`/professor/modules/${m.id}/exams`)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-700 rounded py-2 hover:bg-gray-800 text-gray-300 text-sm"
                >
                  <ClipboardList size={16} /> Exámenes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ModuleFormModal
          courseId={courseId}
          module={selectedModule}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchModules}
        />
      )}
    </div>
  );
}
