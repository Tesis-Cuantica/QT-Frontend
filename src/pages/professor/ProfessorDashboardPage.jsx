import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  BookOpen,
  FlaskConical,
  ClipboardList,
  Users,
  Layers,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProfessorDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports/professor");
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-400">Cargando reportes...</div>
    );

  if (!data)
    return (
      <div className="p-6 text-center text-red-400">
        Error al cargar datos del reporte.
      </div>
    );

  const summaryCards = [
    {
      icon: <BookOpen size={22} />,
      title: "Cursos",
      value: data.totalCourses ?? 0,
      color: "from-purple-600 to-blue-500",
    },
    {
      icon: <Layers size={22} />,
      title: "Módulos",
      value: data.totalModules ?? 0,
      color: "from-fuchsia-600 to-pink-500",
    },
    {
      icon: <FlaskConical size={22} />,
      title: "Laboratorios",
      value: data.totalLabs ?? 0,
      color: "from-cyan-600 to-teal-500",
    },
    {
      icon: <ClipboardList size={22} />,
      title: "Exámenes",
      value: data.totalExams ?? 0,
      color: "from-indigo-600 to-sky-500",
    },
    {
      icon: <Users size={22} />,
      title: "Estudiantes",
      value: data.totalStudents ?? 0,
      color: "from-emerald-600 to-green-500",
    },
    {
      icon: <Trophy size={22} />,
      title: "Promedio general",
      value: `${data.avgScore?.toFixed(1) ?? 0}%`,
      color: "from-yellow-600 to-amber-500",
    },
  ];

  const chartData =
    data.coursesPerformance?.map((c) => ({
      name: c.title,
      promedio: c.averageScore,
    })) || [];

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-purple-400">Panel de Reportes</h1>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((item, i) => (
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

      {/* Chart Section */}
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">
          Rendimiento promedio por curso
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1d",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <Bar dataKey="promedio" fill="#a855f7" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">
            No hay datos suficientes para generar el gráfico.
          </p>
        )}
      </div>
    </div>
  );
}
