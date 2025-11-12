import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import {
  Layers,
  BookOpen,
  FlaskConical,
  FileQuestion,
  Loader2,
} from "lucide-react";

export default function StudentModulesPage() {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchModules = async () => {
    try {
      const res = await api.get(`/modules/courses/${courseId}`);
      const data = res.data;
      setCourse(data.course || null);
      setModules(data.modules || []);
    } catch (err) {
      console.error("Error al cargar módulos del curso:", err);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Cargando módulos...
      </div>
    );

  if (modules.length === 0)
    return (
      <div className="p-6 text-center text-gray-400">
        No hay módulos disponibles para este curso.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-purple-400">
        {course ? course.title : "Curso sin título"}
      </h1>
      <p className="text-sm text-gray-400">
        Explora los módulos disponibles y accede a sus lecciones, laboratorios y
        exámenes.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-[#111114] border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-purple-500/40 transition shadow-md"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-100 mb-1">
                {mod.title}
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Orden: {mod.order ?? "—"}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-purple-600/20 px-2 py-1 rounded border border-purple-600/30">
                  {mod.lessons ?? 0} lecciones
                </span>
                <span className="text-xs bg-pink-600/20 px-2 py-1 rounded border border-pink-600/30">
                  {mod.labs ?? 0} labs
                </span>
                <span className="text-xs bg-blue-600/20 px-2 py-1 rounded border border-blue-600/30">
                  {mod.exams ?? 0} exámenes
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => navigate(`/student/modules/${mod.id}/lessons`)}
                className="w-full flex items-center justify-center gap-2 bg-purple-600/20 text-purple-300 border border-purple-600/40 py-2 rounded-md hover:bg-purple-600/30 transition"
              >
                <BookOpen size={16} /> Lecciones
              </button>

              <button
                onClick={() => navigate(`/student/modules/${mod.id}/labs`)}
                className="w-full flex items-center justify-center gap-2 bg-pink-600/20 text-pink-300 border border-pink-600/40 py-2 rounded-md hover:bg-pink-600/30 transition"
              >
                <FlaskConical size={16} /> Laboratorios
              </button>

              <button
                onClick={() => navigate(`/student/modules/${mod.id}/exams`)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600/20 text-blue-300 border border-blue-600/40 py-2 rounded-md hover:bg-blue-600/30 transition"
              >
                <FileQuestion size={16} /> Exámenes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
