import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  BookOpen,
  Users,
  Layers,
  BarChart3,
  Target,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function ProfessorReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#22C55E", "#FACC15"];

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports/professor");
      const courses = res.data?.courses || [];

      const totalCourses = courses.length;
      const totalModules = courses.reduce(
        (acc, c) => acc + (c.modules || 0),
        0
      );
      const totalStudents = courses.reduce(
        (acc, c) => acc + (c.students || 0),
        0
      );
      const avgScores = courses
        .map((c) => Number(c.averageScore) || 0)
        .filter((v) => v > 0);
      const averageScore =
        avgScores.length > 0
          ? (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(2)
          : 0;

      setData({
        totalCourses,
        totalModules,
        totalStudents,
        completedAttempts: 0,
        averageScore,
        courses,
      });
    } catch (err) {
      console.error("Error al cargar reporte:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-400 flex justify-center items-center gap-2">
        <Loader2 className="animate-spin" size={24} />
        Cargando estadísticas...
      </div>
    );

  if (!data)
    return (
      <div className="p-6 text-center text-gray-400">
        No hay información disponible.
      </div>
    );

  const pieData = [
    { name: "Cursos", value: data.totalCourses },
    { name: "Módulos", value: data.totalModules },
    { name: "Estudiantes", value: data.totalStudents },
  ];

  const barData = data.courses.map((c) => ({
    name: c.title.length > 15 ? c.title.slice(0, 15) + "…" : c.title,
    promedio: Number(c.averageScore) || 0,
  }));

  return (
    <div className="p-6 space-y-10 animate-fadeIn">
      <h1 className="text-2xl font-bold text-purple-400">
        Reporte del Profesor
      </h1>

      {/* Resumen principal */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
        <StatCard
          icon={<BookOpen className="text-purple-400" size={22} />}
          label="Cursos"
          value={data.totalCourses}
        />
        <StatCard
          icon={<Layers className="text-pink-400" size={22} />}
          label="Módulos"
          value={data.totalModules}
        />
        <StatCard
          icon={<Users className="text-blue-400" size={22} />}
          label="Estudiantes"
          value={data.totalStudents}
        />
        <StatCard
          icon={<ClipboardCheck className="text-green-400" size={22} />}
          label="Intentos calificados"
          value={data.completedAttempts}
        />
        <StatCard
          icon={<Target className="text-yellow-400" size={22} />}
          label="Promedio general"
          value={`${data.averageScore}%`}
        />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gráfico circular */}
        <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg hover:border-purple-600/40 transition">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-400" /> Distribución
            general
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1d",
                    border: "1px solid #333",
                    color: "#ccc",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg hover:border-purple-600/40 transition">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-yellow-400" /> Promedio por curso
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1d",
                    border: "1px solid #333",
                    color: "#ccc",
                  }}
                />
                <Bar dataKey="promedio" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Detalle por curso
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-400">
            <thead className="text-gray-500 border-b border-gray-700">
              <tr>
                <th className="text-left py-2 px-3">Curso</th>
                <th className="text-center py-2 px-3">Estudiantes</th>
                <th className="text-center py-2 px-3">Módulos</th>
                <th className="text-center py-2 px-3">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {data.courses.map((c) => (
                <tr
                  key={c.courseId}
                  className="border-b border-gray-800 hover:bg-gray-900/40 transition"
                >
                  <td className="py-2 px-3 text-gray-200">{c.title}</td>
                  <td className="text-center">{c.students}</td>
                  <td className="text-center">{c.modules}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-purple-400 font-semibold">
                        {c.averageScore || 0}%
                      </span>
                      <div className="w-20 bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-purple-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              Number(c.averageScore) || 0,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#111114] border border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-md hover:border-purple-600/40 hover:scale-[1.03] transition-transform duration-200">
      {icon}
      <p className="text-sm text-gray-400 mt-2">{label}</p>
      <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
    </div>
  );
}
