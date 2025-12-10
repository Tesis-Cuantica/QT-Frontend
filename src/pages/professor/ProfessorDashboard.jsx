import { useEffect, useState } from "react";
import api from "@/services/api";
import { BookOpen, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/common/Loader";

export default function ProfessorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get("/professor/courses");
        setCourses(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Error al cargar cursos:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  if (loading) return <Loader text="Cargando tus cursos..." />;

  return (
    <div className="min-h-screen px-6 py-10 text-white bg-[#0b0b0d]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Mis Cursos</h1>

          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg
            bg-gradient-to-r from-pink-500 to-indigo-500 transition-all
            hover:opacity-85 shadow-md"
          >
            <PlusCircle size={18} />
            Nuevo Curso
          </button>
        </div>

        {/* Cursos */}
        {courses.length === 0 ? (
          <p className="text-gray-400 text-center opacity-70 text-lg">
            No tienes cursos asignados aún.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl p-5 bg-[#131318] border border-[#1e1e24]
                shadow-lg hover:shadow-[0_0_15px_#8b5cf620]
                hover:border-pink-500/60 transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  <BookOpen className="text-pink-400" size={20} />
                </div>

                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                  {course.description || "Sin descripción disponible."}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">
                    Nivel: {course.level}
                  </span>

                  <button
                    onClick={() =>
                      navigate(`/professor/courses/${course.id}/modules`)
                    }
                    className="px-3 py-1.5 rounded text-sm 
                    bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-85 transition"
                  >
                    Ver módulos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
