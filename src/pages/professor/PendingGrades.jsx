// src/pages/professor/PendingGrades.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function PendingGrades() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get("/professor/attempts/pending");
        setAttempts(res.data);
      } catch (err) {
        console.error("Error al cargar intentos pendientes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Exámenes Pendientes de Calificar</h1>
      {attempts.length === 0 ? (
        <div className="text-center p-8 bg-white rounded shadow">
          <p>No hay exámenes pendientes de calificación.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {attempt.exam.title}
                  </h3>
                  <p>
                    <strong>Estudiante:</strong> {attempt.student.name}
                  </p>
                  <p>
                    <strong>Enviado:</strong>{" "}
                    {new Date(attempt.submittedAt).toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/professor/grade/${attempt.id}`}
                  className="text-blue-600 hover:underline self-center"
                >
                  Calificar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
