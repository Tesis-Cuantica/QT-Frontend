import { useEffect, useState } from "react";
import api from "@/services/api";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function StudentAttemptsPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttempts = async () => {
    try {
      const res = await api.get("/attempts/mine");
      setAttempts(res.data || []);
    } catch (err) {
      console.error("Error al cargar intentos del estudiante:", err);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 gap-2">
        <Loader2 className="animate-spin" size={22} />
        Cargando tus intentos...
      </div>
    );

  if (!attempts.length)
    return (
      <div className="p-6 text-center text-gray-400">
        No tienes intentos registrados todavía.
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-purple-400">
        Mis Intentos de Examen
      </h1>

      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg">
        <table className="w-full text-sm text-gray-300">
          <thead className="text-gray-500 border-b border-gray-700">
            <tr>
              <th className="text-left py-3 px-4">Examen</th>
              <th className="text-center py-3 px-4">Fecha</th>
              <th className="text-center py-3 px-4">Estado</th>
              <th className="text-center py-3 px-4">Puntaje</th>
              <th className="text-left py-3 px-4">Retroalimentación</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr
                key={a.id}
                className="border-b border-gray-800 hover:bg-gray-900/50 transition"
              >
                <td className="py-3 px-4 font-medium text-gray-200">
                  {a.exam?.title || "Sin título"}
                </td>
                <td className="text-center text-gray-400">
                  {new Date(a.createdAt).toLocaleString()}
                </td>
                <td className="text-center">
                  <StatusBadge status={a.status} />
                </td>
                <td className="text-center text-purple-400 font-semibold">
                  {a.score !== null && a.score !== undefined
                    ? `${a.score}%`
                    : "—"}
                </td>
                <td className="py-3 px-4 text-gray-400">
                  {a.feedback || "Sin comentarios"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  switch (status) {
    case "GRADED":
      return (
        <span className="flex items-center justify-center gap-1 text-green-400 font-medium">
          <CheckCircle2 size={16} /> Calificado
        </span>
      );
    case "PENDING":
      return (
        <span className="flex items-center justify-center gap-1 text-yellow-400 font-medium">
          <Clock size={16} /> Pendiente
        </span>
      );
    case "FAILED":
      return (
        <span className="flex items-center justify-center gap-1 text-red-500 font-medium">
          <XCircle size={16} /> Reprobado
        </span>
      );
    default:
      return (
        <span className="flex items-center justify-center gap-1 text-gray-400">
          Desconocido
        </span>
      );
  }
}
