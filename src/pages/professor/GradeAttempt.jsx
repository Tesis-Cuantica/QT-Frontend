// src/pages/professor/GradeAttempt.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function GradeAttempt() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [questionGrades, setQuestionGrades] = useState({});

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await api.get(`/api/attempts/${attemptId}`);
        setAttempt(res.data);
        const initialGrades = {};
        res.data.exam.questions.forEach((q) => {
          if (q.type === "ESSAY") {
            initialGrades[q.id] = 0;
          }
        });
        setQuestionGrades(initialGrades);
      } catch {
        alert("Error al cargar el intento.");
        navigate("/professor/pending");
      }
    };
    fetchAttempt();
  }, [attemptId, navigate]);

  const handleGradeChange = (questionId, grade) => {
    setQuestionGrades((prev) => ({
      ...prev,
      [questionId]: parseFloat(grade) || 0,
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.post("/professor/attempts/grade", {
        attemptId,
        feedback,
        questionGrades,
      });
      alert("Intento calificado correctamente.");
      navigate("/professor/pending");
    } catch {
      alert("Error al calificar el intento.");
    }
  };

  if (!attempt) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Calificar Examen</h1>
      <div className="bg-gray-50 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold">{attempt.exam.title}</h2>
        <p>
          <strong>Estudiante:</strong> {attempt.student.name}
        </p>
        <p>
          <strong>Enviado:</strong>{" "}
          {new Date(attempt.submittedAt).toLocaleString()}
        </p>
      </div>

      <div className="space-y-6">
        {attempt.exam.questions.map((question) => {
          const userAnswer = JSON.parse(attempt.answers)[question.id];
          return (
            <div key={question.id} className="border p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{question.text}</h3>
                {question.type === "ESSAY" && (
                  <div className="flex items-center">
                    <label className="mr-2">Nota:</label>
                    <input
                      type="number"
                      value={questionGrades[question.id] || 0}
                      onChange={(e) =>
                        handleGradeChange(question.id, e.target.value)
                      }
                      min="0"
                      step="0.5"
                      className="w-16 p-1 border rounded"
                    />
                  </div>
                )}
              </div>
              {question.type === "ESSAY" && (
                <div className="mb-4">
                  <label className="block mb-1">Respuesta del estudiante</label>
                  <div className="bg-white p-3 rounded whitespace-pre-wrap">
                    {userAnswer || "Sin respuesta"}
                  </div>
                </div>
              )}
              {question.type === "MULTIPLE_CHOICE" && (
                <div className="mb-4">
                  <label className="block mb-1">Respuesta del estudiante</label>
                  <div className="bg-white p-3 rounded">
                    {Array.isArray(userAnswer)
                      ? userAnswer.join(", ")
                      : userAnswer || "No respondido"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <label className="block mb-1">Retroalimentación general</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full p-2 border rounded"
          rows="4"
        />
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => navigate("/professor/pending")}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Calificar y Guardar
        </button>
      </div>
    </div>
  );
}
