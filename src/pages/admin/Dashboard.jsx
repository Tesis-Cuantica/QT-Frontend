import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/reports/admin");
        setStats(res.data);
      } catch (err) {
        console.error("Error al cargar métricas:", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats)
    return (
      <div className="text-center text-gray-400 mt-10 animate-pulse">
        Cargando métricas...
      </div>
    );

  const userData = [
    { name: "Estudiantes", value: stats.users.STUDENT || 0 },
    { name: "Profesores", value: stats.users.PROFESSOR || 0 },
    { name: "Admins", value: stats.users.ADMIN || 0 },
  ];

  const activityData = [
    { name: "Exámenes", valor: stats.recentActivity.examsLast7Days },
    {
      name: "Laboratorios",
      valor: stats.recentActivity.labExecutionsLast7Days,
    },
  ];

  const performanceData = stats.professorPerformance.map((p) => ({
    name: p.name,
    cursos: p.activeCourses,
    estudiantes: p.totalStudents,
  }));

  const COLORS = ["#3B82F6", "#A855F7", "#EC4899", "#22D3EE"];

  return (
    <div className="space-y-10 text-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
          Panel de Administración
        </h1>
        <p className="text-sm text-gray-500">
          Última actualización: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Estudiantes",
            value: stats.users.STUDENT || 0,
            color: "from-blue-500 to-cyan-400",
          },
          {
            label: "Profesores",
            value: stats.users.PROFESSOR || 0,
            color: "from-purple-500 to-pink-500",
          },
          {
            label: "Administradores",
            value: stats.users.ADMIN || 0,
            color: "from-fuchsia-500 to-violet-500",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`p-6 rounded-xl bg-[#121217] border border-gray-800 shadow-md hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all`}
          >
            <h3 className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wide">
              {item.label}
            </h3>
            <p
              className={`text-4xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#121217] p-6 rounded-xl border border-gray-800 shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-100">
          Estado de Cursos
        </h3>
        <p className="text-gray-400">
          Total:{" "}
          <span className="text-blue-400 font-semibold">
            {stats.totalCourses}
          </span>{" "}
          | Activos:{" "}
          <span className="text-green-400 font-semibold">
            {stats.activeCourses}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#121217] p-6 rounded-xl border border-gray-800 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-100">
            Distribución de Usuarios
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={userData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
              >
                {userData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181d",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#121217] p-6 rounded-xl border border-gray-800 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-100">
            Actividad Reciente (últimos 7 días)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181d",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Bar dataKey="valor" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#121217] p-6 rounded-xl border border-gray-800 shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-100">
          Rendimiento por Profesor
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181d",
                border: "none",
                color: "#fff",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cursos"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: "#3B82F6" }}
            />
            <Line
              type="monotone"
              dataKey="estudiantes"
              stroke="#EC4899"
              strokeWidth={2}
              dot={{ fill: "#EC4899" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
