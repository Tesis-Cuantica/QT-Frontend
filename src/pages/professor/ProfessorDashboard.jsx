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
        setCourses(res.data.data || res.data || []);
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Mis Cursos</h1>
      {courses.length === 0 ? (
        <p className="text-qt-muted">No tienes cursos asignados.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-qt-panel border border-qt-border rounded-lg p-4 hover:border-qt-accent/40 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{course.title}</h2>
                <BookOpen className="text-qt-accent" size={18} />
              </div>
              <p className="text-sm text-qt-muted line-clamp-2">
                {course.description}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-qt-muted">
                  Nivel: {course.level}
                </span>
                <button
                  onClick={() =>
                    navigate(`/professor/courses/${course.id}/modules`)
                  }
                  className="text-sm bg-qt-primary px-3 py-1 rounded"
                >
                  Ver módulos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
