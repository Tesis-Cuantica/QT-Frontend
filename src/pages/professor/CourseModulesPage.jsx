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
    } catch {
      alert("Error al eliminar el módulo.");
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-zinc-400 gap-2">
        <Loader2 className="animate-spin" size={20} /> Cargando módulos...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-400">
            Módulos del Curso
          </h1>
          <p className="text-sm text-zinc-300 mt-1">
            Administra los módulos, sus lecciones, laboratorios y exámenes.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedModule(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          <Plus size={18} /> Nuevo Módulo
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="bg-[#111114] border border-zinc-800 rounded-lg p-10 text-center">
          <p className="text-zinc-400">
            No hay módulos creados para este curso. ¡Crea el primero!
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((m) => (
            <div
              key={m.id}
              className="bg-[#111114] border border-zinc-800 rounded-xl p-5 hover:border-purple-600 transition shadow-lg flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-white">{m.title}</h2>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedModule(m);
                      setModalOpen(true);
                    }}
                    className="text-zinc-400 hover:text-blue-400 transition-colors"
                    title="Editar módulo"
                  >
                    <Edit size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-zinc-500 hover:text-red-500 transition-colors"
                    title="Eliminar módulo"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm text-zinc-500 mb-4">
                <span>Orden:</span>
                <span className="font-semibold text-zinc-100">
                  {m.order ?? "-"}
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                <button
                  onClick={() => navigate(`/professor/modules/${m.id}/lessons`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg py-2 text-blue-400 hover:bg-zinc-700 transition-colors text-sm font-medium"
                >
                  <BookOpen size={16} /> Lecciones
                </button>
                <button
                  onClick={() => navigate(`/professor/modules/${m.id}/labs`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg py-2 text-emerald-400 hover:bg-zinc-700 transition-colors text-sm font-medium"
                >
                  <FlaskConical size={16} /> Labs
                </button>
                <button
                  onClick={() => navigate(`/professor/modules/${m.id}/exams`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg py-2 text-yellow-400 hover:bg-zinc-700 transition-colors text-sm font-medium"
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
          onSuccess={() => {
            fetchModules();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
