import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import {
  ClipboardList,
  Loader2,
  FileQuestion,
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function StudentExamsPage() {
  const { moduleId } = useParams();
  const [exams, setExams] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cargar exámenes del módulo
  const fetchExams = async () => {
    try {
      const res = await api.get(`/exams/modules/${moduleId}`);
      const data = res.data;
      setModuleInfo(data.module || null);
      setExams(data.exams || []);
    } catch (err) {
      console.error("Error al cargar exámenes:", err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar preguntas de un examen
  const fetchQuestions = async (examId) => {
    try {
      const res = await api.get(`/questions/exams/${examId}`);
      setQuestions(res.data.questions || []);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
    } catch (err) {
      console.error("Error al cargar preguntas:", err);
    }
  };

  // Enviar respuestas del alumno
  const handleSubmit = async () => {
    if (!selectedExam) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/attempts/exams/${selectedExam.id}`, {
        answers,
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      console.error("Error al enviar respuestas:", err);
      alert("No se pudo enviar el examen.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [moduleId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Cargando exámenes...
      </div>
    );

  if (exams.length === 0)
    return (
      <div className="p-6 text-center text-gray-400">
        No hay exámenes disponibles en este módulo.
      </div>
    );

  return (
    <div className="p-6 grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Sidebar con lista de exámenes */}
      <aside className="bg-[#111114] border border-gray-800 rounded-xl p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-purple-400 mb-4">
          {moduleInfo ? moduleInfo.title : "Módulo"}
        </h2>

        <ul className="space-y-2">
          {exams.map((exam) => (
            <li
              key={exam.id}
              onClick={() => {
                setSelectedExam(exam);
                fetchQuestions(exam.id);
              }}
              className={`p-3 rounded-md cursor-pointer flex items-center gap-2 transition ${
                selectedExam?.id === exam.id
                  ? "bg-blue-600/20 border border-blue-600/30 text-blue-300"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <ClipboardList size={16} />
              <span className="text-sm">{exam.title}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Panel derecho */}
      <section className="bg-[#111114] border border-gray-800 rounded-xl p-6 space-y-6">
        {selectedExam ? (
          <>
            <div>
              <h2 className="text-xl font-bold text-gray-100 mb-2">
                {selectedExam.title}
              </h2>
              <p className="text-sm text-gray-400">
                {selectedExam.description || "Examen sin descripción"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tiempo límite: {selectedExam.timeLimit || "∞"} minutos
              </p>
            </div>

            {/* Preguntas */}
            <div className="space-y-6 mt-4">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="border border-gray-800 rounded-lg p-4 bg-black/20"
                >
                  <p className="text-gray-200 font-medium mb-2">
                    {index + 1}. {q.text}
                  </p>

                  {q.type === "MULTIPLE_CHOICE" ? (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 text-gray-400 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                [q.id]: e.target.value,
                              })
                            }
                            className="accent-purple-500"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                      rows={3}
                      placeholder="Escribe tu respuesta..."
                      className="w-full bg-black/40 border border-gray-700 rounded p-2 text-gray-200 text-sm focus:border-purple-500 outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Botón de envío */}
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
                className="flex items-center gap-2 bg-blue-600/20 border border-blue-600/40 text-blue-300 px-4 py-2 rounded-md hover:bg-blue-600/30 transition disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
                {submitting ? "Enviando..." : "Enviar Examen"}
              </button>
            )}

            {/* Resultado */}
            {submitted && result && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  result.status === "PASSED"
                    ? "border-green-500/40 bg-green-600/10"
                    : "border-red-500/40 bg-red-600/10"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result.status === "PASSED" ? (
                    <CheckCircle2 className="text-green-400" size={20} />
                  ) : (
                    <XCircle className="text-red-400" size={20} />
                  )}
                  <h4 className="font-semibold text-gray-100">
                    Resultado del intento
                  </h4>
                </div>
                <p className="text-sm text-gray-300">
                  Puntuación:{" "}
                  <span className="font-bold text-purple-400">
                    {result.score ?? "N/A"}
                  </span>
                </p>
                {result.feedback && (
                  <p className="text-sm text-gray-400 mt-1">
                    Comentario: {result.feedback}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400">Selecciona un examen para comenzar.</p>
        )}
      </section>
    </div>
  );
}
