import { useEffect, useState } from "react";
import api from "@/services/api";
import {
  Users,
  Layers,
  BookOpen,
  FlaskConical,
  ClipboardList,
  Trophy,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

export default function AdminReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const res = await api.get("/reports/admin");
      const data = res.data;

      // Normalización de claves del backend
      const parsed = {
        totalUsers: data.users ?? 0,
        totalCourses: data.courses ?? 0,
        totalModules: data.modules ?? 0,
        totalLabs: data.labs ?? 0,
        totalExams: data.exams ?? 0,
        avgScore: parseFloat(data.averageScore ?? 0),
        totalAdmins: data.admins ?? 0,
        totalProfessors: data.professors ?? 0,
        totalStudents: data.students ?? 0,
        coursePerformance: data.coursePerformance || [],
      };

      setReport(parsed);
    } catch (err) {
      console.error("Error al cargar reportes del admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-gray-400 text-center flex justify-center items-center gap-2">
        <Loader2 className="animate-spin" /> Cargando reportes globales...
      </div>
    );

  if (!report)
    return (
      <div className="p-6 text-red-400 text-center">
        Error al obtener los datos del sistema.
      </div>
    );

  const summary = [
    {
      icon: <Users size={22} />,
      title: "Usuarios Totales",
      value: report.totalUsers,
      color: "from-purple-600 to-blue-500",
    },
    {
      icon: <BookOpen size={22} />,
      title: "Cursos Activos",
      value: report.totalCourses,
      color: "from-indigo-600 to-sky-500",
    },
    {
      icon: <Layers size={22} />,
      title: "Módulos",
      value: report.totalModules,
      color: "from-fuchsia-600 to-pink-500",
    },
    {
      icon: <FlaskConical size={22} />,
      title: "Laboratorios",
      value: report.totalLabs,
      color: "from-cyan-600 to-teal-500",
    },
    {
      icon: <ClipboardList size={22} />,
      title: "Exámenes",
      value: report.totalExams,
      color: "from-orange-600 to-yellow-500",
    },
    {
      icon: <Trophy size={22} />,
      title: "Promedio Global",
      value: `${report.avgScore?.toFixed(1) ?? 0}%`,
      color: "from-emerald-600 to-green-500",
    },
  ];

  const COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  const userRolesChart = [
    { name: "Administradores", value: report.totalAdmins ?? 0 },
    { name: "Profesores", value: report.totalProfessors ?? 0 },
    { name: "Estudiantes", value: report.totalStudents ?? 0 },
  ];

  const courseChart =
    report.coursePerformance?.map((c) => ({
      name: c.title?.length > 15 ? c.title.slice(0, 15) + "…" : c.title,
      promedio: Number(c.averageScore) || 0,
    })) || [];

  const totalRoles = userRolesChart.reduce((a, b) => a + b.value, 0);
  const activeCoursesPercent = (
    (report.totalCourses / (report.totalUsers || 1)) *
    100
  ).toFixed(1);

  return (
    <div className="p-6 space-y-10 animate-fadeIn">
      <h1 className="text-2xl font-bold text-purple-400">
        Reportes Globales del Sistema
      </h1>

      {/* Resumen principal */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {summary.map((item, i) => (
          <div
            key={i}
            className="bg-[#111114] border border-gray-800 rounded-xl p-5 flex items-center gap-4 hover:border-purple-500/30 hover:scale-[1.02] transition-transform duration-200"
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

      {/* Métricas rápidas */}
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-gray-400 text-sm">% Cursos Activos / Usuarios</h2>
          <p className="text-3xl font-bold text-indigo-400">
            {activeCoursesPercent}%
          </p>
        </div>
        <div>
          <h2 className="text-gray-400 text-sm">% Promedio Global</h2>
          <p className="text-3xl font-bold text-green-400">
            {report.avgScore?.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Distribución de roles */}
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">
          Distribución de Usuarios por Rol
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={userRolesChart}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              labelLine={false}
              label={({ name, value }) =>
                `${name}: ${((value / (totalRoles || 1)) * 100).toFixed(1)}%`
              }
            >
              {userRolesChart.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
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
      </div>

      {/* Rendimiento promedio por curso */}
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">
          Promedio de Rendimiento por Curso
        </h2>
        {courseChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={courseChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1d",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <Bar dataKey="promedio" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No hay suficientes datos para mostrar el gráfico.
          </p>
        )}
      </div>
    </div>
  );
}
