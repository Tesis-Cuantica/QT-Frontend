// src/pages/professor/CreateExam.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CreateExam() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    maxAttempts: 1,
    passingScore: 70,
    published: false,
    availableFrom: "",
    availableTo: "",
    questions: [],
  });

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          type: "MULTIPLE_CHOICE",
          text: "",
          options: [""],
          correct: [""],
          points: 1.0,
          order: prev.questions.length + 1,
        },
      ],
    }));
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleCorrectChange = (qIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].correct = value;
    setFormData((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/exams", {
        ...formData,
        moduleId: parseInt(moduleId),
        questions: formData.questions.map((q) => ({
          ...q,
          options: q.options && q.options.length > 0 ? q.options : undefined,
        })),
      });
      alert("Examen creado exitosamente.");
      navigate(`/professor/courses/${res.data.module.courseId}`);
    } catch {
      alert("Error al crear el examen.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Crear Examen</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              rows="2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Tiempo límite (min)</label>
            <input
              type="number"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timeLimit: parseInt(e.target.value),
                })
              }
              min="1"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Intentos máximos</label>
            <input
              type="number"
              name="maxAttempts"
              value={formData.maxAttempts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxAttempts: parseInt(e.target.value),
                })
              }
              min="1"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Nota mínima (%)</label>
            <input
              type="number"
              name="passingScore"
              value={formData.passingScore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passingScore: parseFloat(e.target.value),
                })
              }
              min="0"
              max="100"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Publicado</label>
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
              className="mr-2"
            />
          </div>
          <div>
            <label className="block mb-1">Disponible desde</label>
            <input
              type="datetime-local"
              name="availableFrom"
              value={formData.availableFrom}
              onChange={(e) =>
                setFormData({ ...formData, availableFrom: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Disponible hasta</label>
            <input
              type="datetime-local"
              name="availableTo"
              value={formData.availableTo}
              onChange={(e) =>
                setFormData({ ...formData, availableTo: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Preguntas</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Añadir Pregunta
            </button>
          </div>
          {formData.questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-gray-50 p-4 rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <span>Pregunta {qIndex + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Tipo</label>
                <select
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(qIndex, "type", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="MULTIPLE_CHOICE">Opción múltiple</option>
                  <option value="SHORT_ANSWER">Respuesta corta</option>
                  <option value="ESSAY">Ensayo</option>
                  <option value="QUANTUM_SIMULATION">Ejercicio cuántico</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Texto *</label>
                <textarea
                  value={question.text}
                  onChange={(e) =>
                    updateQuestion(qIndex, "text", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>
              {question.type === "MULTIPLE_CHOICE" && (
                <div className="mb-4">
                  <label className="block mb-1">Opciones</label>
                  {question.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex mb-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(qIndex, optIndex, e.target.value)
                        }
                        className="flex-1 p-2 border rounded mr-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = [...question.options];
                          newOptions.splice(optIndex, 1);
                          updateQuestion(qIndex, "options", newOptions);
                        }}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const newOptions = [...question.options, ""];
                      updateQuestion(qIndex, "options", newOptions);
                    }}
                    className="text-blue-600 hover:underline mt-1"
                  >
                    + Añadir opción
                  </button>
                  <div className="mt-2">
                    <label className="block mb-1">
                      Correctas (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={question.correct.join(",")}
                      onChange={(e) =>
                        handleCorrectChange(qIndex, e.target.value.split(","))
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              )}
              {question.type === "SHORT_ANSWER" && (
                <div className="mb-4">
                  <label className="block mb-1">Respuesta correcta</label>
                  <input
                    type="text"
                    value={question.correct}
                    onChange={(e) =>
                      handleCorrectChange(qIndex, e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
              {question.type === "ESSAY" && (
                <div className="mb-4">
                  <label className="block mb-1">Puntaje máximo</label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(
                        qIndex,
                        "points",
                        parseFloat(e.target.value)
                      )
                    }
                    min="0"
                    step="0.5"
                    className="w-full p-2 border rounded"
                  />
                </div>
              )}
              {question.type === "QUANTUM_SIMULATION" && (
                <div className="mb-4">
                  <label className="block mb-1">
                    Resultado esperado (JSON)
                  </label>
                  <textarea
                    value={question.correct}
                    onChange={(e) =>
                      handleCorrectChange(qIndex, e.target.value)
                    }
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block mb-1">Puntos</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) =>
                    updateQuestion(qIndex, "points", parseFloat(e.target.value))
                  }
                  min="0"
                  step="0.5"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Crear Examen
        </button>
      </form>
    </div>
  );
}
