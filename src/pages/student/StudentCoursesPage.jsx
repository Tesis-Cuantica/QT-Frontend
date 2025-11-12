import { useEffect, useState } from "react";
import api from "@/services/api";
import { Loader2 } from "lucide-react";

export default function StudentCoursesPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const res = await api.get("/reports/student");
      setReport(res.data);
    } catch (err) {
      console.error("Error al cargar el reporte del estudiante:", err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 gap-2">
        <Loader2 className="animate-spin" size={22} />
        Cargando tus cursos...
      </div>
    );

  const courses = report?.courses || [];

  if (!courses.length)
    return (
      <div className="p-6 text-center text-gray-400">
        No tienes cursos asignados aún.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-purple-400">Mis Cursos</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <div
            key={c.id}
            className="bg-[#111114] border border-gray-800 rounded-xl p-5 shadow hover:border-purple-600/40 hover:shadow-purple-600/20 transition"
          >
            <h2 className="text-lg font-semibold text-gray-200 mb-2">
              {c.title}
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Estado:{" "}
              <span
                className={
                  c.status === "ACTIVE" ? "text-green-400" : "text-gray-500"
                }
              >
                {c.status}
              </span>
            </p>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
              <div
                className="bg-purple-500 h-2"
                style={{ width: `${c.progress || 0}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              Avance:{" "}
              <span className="text-purple-400">{c.progress || 0}%</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
