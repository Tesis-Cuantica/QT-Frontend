import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import { Loader2, ClipboardList, CheckCircle2, XCircle } from "lucide-react";

export default function StudentExamDetailPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExam = async () => {
    try {
      const res = await api.get(`/exams/${examId}`);
      setExam(res.data);
    } catch (err) {
      console.error("Error al cargar el examen:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [examId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Cargando examen...
      </div>
    );

  if (!exam)
    return (
      <div className="p-6 text-center text-gray-400">
        No se encontró información del examen.
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-purple-400 mb-2">
          {exam.title}
        </h1>
        <p className="text-gray-400 mb-2">{exam.description}</p>
        <p className="text-sm text-gray-500">
          Tiempo límite: {exam.timeLimit} min • Nota mínima: {exam.passingScore}
          %
        </p>
      </div>

      {exam.questions && (
        <div className="bg-[#111114] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-purple-400" /> Preguntas
          </h2>
          <ul className="space-y-4">
            {exam.questions.map((q, i) => (
              <li
                key={q.id}
                className="border border-gray-800 rounded-lg p-4 bg-black/20"
              >
                <p className="text-gray-200 font-medium mb-1">
                  {i + 1}. {q.text}
                </p>
                <p className="text-sm text-gray-500">Puntos: {q.points ?? 0}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
