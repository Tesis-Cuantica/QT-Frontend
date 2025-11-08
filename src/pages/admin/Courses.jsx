import { useEffect, useState } from "react";
import api from "../../services/api";
import { motion as Motion } from "framer-motion";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await api.get("/admin/courses");
    setCourses(res.data);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/admin/courses/${id}/status`, { status });
    fetchCourses();
  };

  const statusColors = {
    DRAFT: "bg-gray-600/20 text-gray-400 border border-gray-600/30",
    ACTIVE: "bg-green-500/20 text-green-400 border border-green-500/30",
    CLOSED: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  return (
    <div className="space-y-8 text-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Gestión de Cursos
        </h1>
        <p className="text-sm text-gray-500">Total: {courses.length} cursos</p>
      </div>

      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#121217] p-6 rounded-xl border border-gray-800 shadow-lg overflow-x-auto"
      >
        <table className="min-w-full text-left text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-400 uppercase text-xs tracking-wide">
              <th className="pb-3 px-3">Título</th>
              <th className="pb-3 px-3">Profesor</th>
              <th className="pb-3 px-3">Estado</th>
              <th className="pb-3 px-3">Inscritos</th>
              <th className="pb-3 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, i) => (
              <Motion.tr
                key={course.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`${
                  i % 2 === 0 ? "bg-[#141418]" : "bg-[#18181d]"
                } hover:bg-[#1f1f27] transition rounded-lg`}
              >
                <td className="py-3 px-3 rounded-l-lg">{course.title}</td>
                <td className="py-3 px-3 text-gray-400">
                  {course.professor?.name || "—"}
                </td>
                <td className="py-3 px-3">
                  <select
                    value={course.status}
                    onChange={(e) => updateStatus(course.id, e.target.value)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-transparent ${
                      statusColors[course.status]
                    }`}
                  >
                    <option value="DRAFT" className="bg-gray-900 text-gray-400">
                      Borrador
                    </option>
                    <option
                      value="ACTIVE"
                      className="bg-gray-900 text-green-400"
                    >
                      Activo
                    </option>
                    <option value="CLOSED" className="bg-gray-900 text-red-400">
                      Cerrado
                    </option>
                  </select>
                </td>
                <td className="py-3 px-3 text-blue-400 font-medium">
                  {course._count?.enrollments || 0}
                </td>
                <td className="py-3 px-3 text-center rounded-r-lg">
                  <button className="text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-400/50 px-3 py-1 rounded-lg text-xs transition-all">
                    Ver
                  </button>
                </td>
              </Motion.tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            No hay cursos registrados.
          </div>
        )}
      </Motion.div>
    </div>
  );
}
