// src/pages/professor/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function ProfessorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/professor/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Error al cargar cursos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mis Cursos</h1>
        <Link
          to="/professor/courses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear Nuevo Curso
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center p-8 bg-white rounded shadow">
          <p>No tienes cursos creados.</p>
          <Link
            to="/professor/courses/new"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Comienza creando uno
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="text-gray-600 text-sm">{course.description}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span>Módulos: {course.modules.length}</span>
                <span>Alumnos: {course.enrollments.length}</span>
              </div>
              <div className="mt-4 space-x-2">
                <Link
                  to={`/professor/courses/${course.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Ver Detalle
                </Link>
                <Link
                  to={`/professor/courses/${course.id}/edit`}
                  className="text-gray-600 hover:underline"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
