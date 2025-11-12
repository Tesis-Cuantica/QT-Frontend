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
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-qt-muted">
          Supervisa el estado general del LMS QuantumTec y accede a los módulos
          de gestión.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={<Users size={20} />}
          title="Usuarios totales"
          value={report.totalUsers}
          color="from-qt-primary to-qt-accent"
        />
        <MetricCard
          icon={<Users size={20} />}
          title="Profesores"
          value={report.totalProfessors}
          color="from-purple-500 to-pink-500"
        />
        <MetricCard
          icon={<Users size={20} />}
          title="Estudiantes"
          value={report.totalStudents}
          color="from-cyan-400 to-blue-500"
        />
        <MetricCard
          icon={<BookOpen size={20} />}
          title="Cursos totales"
          value={report.totalCourses}
          color="from-yellow-500 to-orange-500"
        />
        <MetricCard
          icon={<Activity size={20} />}
          title="Cursos activos"
          value={report.activeCourses}
          color="from-green-400 to-emerald-500"
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-qt-panel border border-qt-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">
            Distribución de Usuarios
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={userData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                label
              >
                {userData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#111114",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2 text-sm text-qt-muted">
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

        <div className="bg-qt-panel border border-qt-border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Estado de los Cursos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={coursesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: "#111114",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Accesos rápidos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    <div className="bg-qt-panel border border-qt-border rounded-lg p-4 shadow-sm hover:border-qt-accent/40 transition">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`bg-gradient-to-r ${color} text-transparent bg-clip-text font-bold text-lg`}
        >
          {value}
        </div>
        <div className="text-qt-muted">{icon}</div>
      </div>
      <p className="text-sm text-qt-muted">{title}</p>
    </div>
  );
}

function QuickLink({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 p-4 rounded-lg bg-qt-panel border border-qt-border hover:border-qt-accent/40 hover:text-qt-accent transition"
    >
      <div className="text-qt-accent">{icon}</div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
