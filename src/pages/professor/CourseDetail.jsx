// src/pages/professor/CourseDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/api/courses/${id}`);
        setCourse(res.data);
      } catch {
        alert("Error al cargar el curso.");
        navigate("/professor");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, navigate]);

  if (loading) return <div>Cargando...</div>;
  if (!course) return <div>Curso no encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <div className="space-x-2">
          <Link
            to={`/professor/courses/${id}/edit`}
            className="text-gray-600 hover:underline"
          >
            Editar Curso
          </Link>
          <Link
            to={`/professor/courses/${id}/modules/new`}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Agregar Módulo
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Módulos</h2>
        {course.modules.length === 0 ? (
          <p>No hay módulos aún. ¡Empieza agregando uno!</p>
        ) : (
          <ul className="space-y-4">
            {course.modules.map((module) => (
              <li key={module.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{module.title}</h3>
                    <p className="text-gray-600 text-sm">
                      Orden: {module.order}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Link
                      to={`/professor/courses/${id}/modules/${module.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <Link
                      to={`/professor/courses/${id}/modules/${module.id}/lessons/new`}
                      className="text-gray-600 hover:underline"
                    >
                      Lecciones
                    </Link>
                    <Link
                      to={`/professor/courses/${id}/modules/${module.id}/labs/new`}
                      className="text-gray-600 hover:underline"
                    >
                      Laboratorios
                    </Link>
                    <Link
                      to={`/professor/courses/${id}/modules/${module.id}/exams/new`}
                      className="text-gray-600 hover:underline"
                    >
                      Exámenes
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Estudiantes Inscritos</h2>
        {course.enrollments.length === 0 ? (
          <p>No hay estudiantes inscritos en este curso.</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Progreso</th>
                <th>Completado</th>
              </tr>
            </thead>
            <tbody>
              {course.enrollments.map((enrollment) => (
                <tr key={enrollment.student.id}>
                  <td>{enrollment.student.name}</td>
                  <td>{enrollment.progress.toFixed(1)}%</td>
                  <td>{enrollment.completed ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
