import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  BookOpen,
  Layers,
  Trophy,
  FlaskConical,
  ClipboardList,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2 } from "lucide-react";

export default function StudentReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const res = await api.get("/reports/student");
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar reporte del estudiante:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] gap-2 text-gray-400">
        <Loader2 className="animate-spin" size={22} />
        Cargando tu reporte de progreso...
      </div>
    );

  if (!data)
    return (
      <div className="text-center text-red-400 p-6">
        Error al cargar tu reporte. Intenta nuevamente.
      </div>
    );

  const stats = data.stats || {};
  const courses = data.courses || [];
  const avgScore = Number(data.averageScore || stats.averageScore || 0).toFixed(
    1
  );

  const summary = [
    {
      icon: <BookOpen size={20} />,
      title: "Cursos Activos",
      value: courses.length,
      color: "from-purple-600 to-indigo-500",
    },
    {
      icon: <Layers size={20} />,
      title: "Lecciones Completadas",
      value: stats.completedLessons ?? 0,
      color: "from-blue-600 to-sky-500",
    },
    {
      icon: <FlaskConical size={20} />,
      title: "Laboratorios Realizados",
      value: stats.completedLabs ?? 0,
      color: "from-cyan-600 to-teal-500",
    },
    {
      icon: <ClipboardList size={20} />,
      title: "Exámenes Presentados",
      value: stats.completedExams ?? 0,
      color: "from-orange-600 to-yellow-500",
    },
    {
      icon: <Trophy size={20} />,
      title: "Promedio General",
      value: `${avgScore}%`,
      color: "from-emerald-600 to-green-500",
    },
  ];

  const COLORS = [
    "#a855f7",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  const progressChart =
    courses.map((c) => ({
      name: c.title,
      progreso: c.progress || 0,
    })) || [];

  const scoreChart =
    data.scores?.map((s) => ({
      name: s.examTitle || `Examen ${s.id}`,
      puntaje: s.score || 0,
    })) || [];

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-purple-400">
        Reporte de Rendimiento del Estudiante
      </h1>

      {/* Resumen general */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {summary.map((item, i) => (
          <div
            key={i}
            className="bg-[#111114] border border-gray-800 rounded-xl p-5 flex items-center gap-4 hover:border-purple-500/30 transition"
          >
            <div
              className={`p-3 rounded-full bg-gradient-to-r ${item.color} text-white`}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-400">{item.title}</p>
              <p className="text-xl font-semibold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progreso por curso */}
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">
          Progreso por Curso
        </h2>
        {progressChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressChart}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1d",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <Bar dataKey="progreso" fill="#a855f7" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">
            No hay progreso disponible aún.
          </p>
        )}
      </div>

      {/* Distribución de notas */}
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">
          Distribución de Notas en Exámenes
        </h2>
        {scoreChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scoreChart}
                dataKey="puntaje"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, puntaje }) => `${name}: ${puntaje}%`}
              >
                {scoreChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1d",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">
            No hay datos de exámenes todavía.
          </p>
        )}
      </div>
    </div>
  );
}
