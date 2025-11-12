import { useEffect, useState } from "react";
import api from "@/services/api";
import Loader from "@/components/common/Loader";
import { Users, BookOpen, Activity, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111114] border border-zinc-700 p-3 rounded-lg shadow-lg">
        <p className="text-sm text-white">{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, coursesRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/courses"),
        ]);

        const users = usersRes.data.data || usersRes.data || [];
        const courses = coursesRes.data.data || coursesRes.data || [];

        const totalUsers = users.length;
        const totalProfessors = users.filter(
          (u) => u.role === "PROFESSOR"
        ).length;
        const totalStudents = users.filter((u) => u.role === "STUDENT").length;
        const totalCourses = courses.length;
        const activeCourses = courses.filter(
          (c) => c.status === "ACTIVE"
        ).length;

        setReport({
          totalUsers,
          totalProfessors,
          totalStudents,
          totalCourses,
          activeCourses,
        });
      } catch (err) {
        console.error("Error al cargar métricas:", err);
        setReport({
          totalUsers: 0,
          totalProfessors: 0,
          totalStudents: 0,
          totalCourses: 0,
          activeCourses: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Loader text="Cargando métricas del sistema..." />;

  const userData = [
    { name: "Profesores", value: report.totalProfessors },
    { name: "Estudiantes", value: report.totalStudents },
    {
      name: "Admins",
      value:
        report.totalUsers - (report.totalProfessors + report.totalStudents),
    },
  ];

  const coursesData = [
    { name: "Activos", value: report.activeCourses },
    {
      name: "Cerrados",
      value: report.totalCourses - report.activeCourses,
    },
  ];

  const COLORS = ["#7c3aed", "#22d3ee", "#facc15"];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">
          Panel de Administración
        </h1>
        <p className="text-zinc-400 mt-1">
          Supervisa el estado general del LMS QuantumTec y accede a los módulos
          de gestión.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          icon={<Users size={22} />}
          title="Usuarios totales"
          value={report.totalUsers}
          color="from-purple-600 to-blue-600"
        />
        <MetricCard
          icon={<Users size={22} />}
          title="Profesores"
          value={report.totalProfessors}
          color="from-purple-500 to-pink-500"
        />
        <MetricCard
          icon={<Users size={22} />}
          title="Estudiantes"
          value={report.totalStudents}
          color="from-cyan-400 to-blue-500"
        />
        <MetricCard
          icon={<BookOpen size={22} />}
          title="Cursos totales"
          value={report.totalCourses}
          color="from-yellow-500 to-orange-500"
        />
        <MetricCard
          icon={<Activity size={22} />}
          title="Cursos activos"
          value={report.activeCourses}
          color="from-green-400 to-emerald-500"
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#111114] border border-zinc-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Distribución de Usuarios
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {userData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm text-zinc-400">
            {userData.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: COLORS[i] }}
                ></span>
                {u.name}: {u.value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111114] border border-zinc-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Estado de los Cursos
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={coursesData}
              margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="name" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#3f3f46" }}
              />
              <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-white">
          Accesos rápidos
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            to="/admin/users"
            label="Gestionar Usuarios"
            icon={<Users size={18} />}
          />
          <QuickLink
            to="/admin/courses"
            label="Gestionar Cursos"
            icon={<BookOpen size={18} />}
          />
          <QuickLink
            to="/admin/reports"
            label="Ver Reportes Globales"
            icon={<BarChart3 size={18} />}
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, title, value, color }) {
  return (
    <div className="bg-[#111114] border border-zinc-800 rounded-lg p-5 shadow-lg hover:border-purple-500/50 transition-colors">
      <div className="flex items-center justify-between">
        <span
          className={`text-3xl font-bold bg-gradient-to-r ${color} text-transparent bg-clip-text`}
        >
          {value}
        </span>
        <span className="text-zinc-500">{icon}</span>
      </div>
      <p className="text-sm text-zinc-400 mt-2">{title}</p>
    </div>
  );
}

function QuickLink({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-4 rounded-lg bg-[#111114] border border-zinc-800 hover:border-purple-500/50 hover:text-purple-400 transition-colors"
    >
      <div className="text-purple-400">{icon}</div>
      <span className="font-medium text-white">{label}</span>
    </Link>
  );
}
