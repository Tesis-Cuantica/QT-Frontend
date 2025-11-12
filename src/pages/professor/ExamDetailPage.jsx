import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import {
  Plus,
  Save,
  X,
  Trash2,
  Edit2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    text: "",
    type: "MULTIPLE_CHOICE",
    options: [],
    correct: "",
    points: 1,
    order: 1,
  });
  const [newOption, setNewOption] = useState("");
  const [orderConflict, setOrderConflict] = useState(false);

  const fetchExam = async () => {
    try {
      const res = await api.get(`/exams/${examId}`);
      setExam(res.data);
    } catch (err) {
      console.error("Error al obtener examen:", err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/questions/exams/${examId}`);
      setQuestions(res.data);
    } catch (err) {
      console.error("Error al cargar preguntas:", err);
    }
  };

  useEffect(() => {
    fetchExam();
    fetchQuestions();
  }, [examId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "order") {
        const conflict = questions.some(
          (q) => q.order === Number(value) && q.id !== editingId
        );
        setOrderConflict(conflict);
      }

      return updated;
    });
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, newOption.trim()],
    }));
    setNewOption("");
  };

  const removeOption = (index) => {
    setForm((prev) => {
      const updated = prev.options.filter((_, i) => i !== index);
      const removed = prev.options[index];
      return {
        ...prev,
        options: updated,
        correct: prev.correct === removed ? "" : prev.correct,
      };
    });
  };

  const setCorrectAnswer = (option) => {
    setForm((prev) => ({
      ...prev,
      correct: option,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.text.trim()) {
      alert("La pregunta no puede estar vacía.");
      return;
    }

    if (orderConflict) {
      alert(
        "El número de orden ya está ocupado. Cambia el orden antes de guardar."
      );
      return;
    }

    if (form.type === "MULTIPLE_CHOICE") {
      if (form.options.length === 0) {
        alert("Debe agregar al menos una opción.");
        return;
      }
      if (!form.correct) {
        alert("Debes marcar una respuesta correcta.");
        return;
      }
    }

    try {
      const payload = {
        text: form.text,
        type: form.type,
        options:
          form.type === "MULTIPLE_CHOICE" ? JSON.stringify(form.options) : null,
        correct: form.correct || "",
        points: Number(form.points),
        order: Number(form.order),
      };

      if (editingId) {
        await api.patch(`/questions/${editingId}`, payload);
      } else {
        await api.post(`/questions/exams/${examId}`, payload);
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchQuestions();
    } catch (err) {
      console.error("Error al guardar pregunta:", err.response?.data || err);
      alert(err.response?.data?.message || "Error al guardar pregunta");
    }
  };

  const handleEdit = (q) => {
    setForm({
      text: q.text,
      type: q.type,
      options: q.options ? JSON.parse(q.options) : [],
      correct: q.correct,
      points: q.points,
      order: q.order,
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    try {
      await api.delete(`/questions/${id}`);
      fetchQuestions();
    } catch {
      alert("Error al eliminar pregunta");
    }
  };

  const resetForm = () => {
    setForm({
      text: "",
      type: "MULTIPLE_CHOICE",
      options: [],
      correct: "",
      points: 1,
      order: 1,
    });
    setNewOption("");
    setOrderConflict(false);
  };

  if (!exam)
    return (
      <div className="p-6 text-center text-gray-400">Cargando examen...</div>
    );

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          {exam.title || "Examen sin título"}
        </h1>
      </div>

      <div className="bg-[#111114] border border-gray-800 rounded-lg p-5 shadow-md">
        <p className="text-gray-300">{exam.description || "Sin descripción"}</p>
        <div className="text-sm text-gray-500 mt-2 space-x-3">
          <span>⏱ {exam.timeLimit} min</span>
          <span>• Intentos: {exam.maxAttempts}</span>
          <span>• Nota mínima: {exam.passingScore}%</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-purple-300">Preguntas</h2>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white flex items-center gap-2 shadow-md"
        >
          <Plus size={16} />
          {showForm ? "Cerrar" : "Nueva pregunta"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#111114] border border-gray-800 p-6 rounded-xl space-y-5 shadow-lg animate-fadeIn"
        >
          <div>
            <label className="text-sm text-gray-400">
              Texto de la pregunta
            </label>
            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              className="w-full mt-1 p-3 bg-gray-900 border border-gray-700 rounded text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none min-h-[90px]"
              placeholder="Ej: ¿Qué es un qubit?"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400">Tipo de pregunta</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              >
                <option value="MULTIPLE_CHOICE">Opción múltiple</option>
                <option value="SHORT_ANSWER">Respuesta corta</option>
                <option value="ESSAY">Ensayo</option>
                <option value="QUANTUM_SIMULATION">Simulación cuántica</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Puntaje</label>
              <input
                type="number"
                name="points"
                value={form.points}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Orden</label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                className={`w-full mt-1 p-2 rounded text-gray-100 ${
                  orderConflict
                    ? "bg-red-900/40 border border-red-500 focus:ring-red-600"
                    : "bg-gray-900 border border-gray-700"
                }`}
              />
              {orderConflict && (
                <div className="flex items-center gap-2 mt-1 text-sm text-red-400">
                  <AlertTriangle size={14} />
                  <span>Ese número de orden ya está ocupado.</span>
                </div>
              )}
            </div>
          </div>

          {form.type === "MULTIPLE_CHOICE" && (
            <div className="space-y-3">
              <label className="text-sm text-gray-400">
                Opciones de respuesta
              </label>

              <div className="flex gap-2">
                <input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Escribe una nueva opción"
                  className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-white"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2 mt-2">
                {form.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center px-3 py-2 rounded transition ${
                      form.correct === opt
                        ? "bg-green-500/20 border border-green-500/50"
                        : "bg-gray-900 border border-gray-700"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setCorrectAnswer(opt)}
                    >
                      <input
                        type="radio"
                        name="correct"
                        value={opt}
                        checked={form.correct === opt}
                        readOnly
                        className="accent-green-500 cursor-pointer"
                      />
                      <span className="text-gray-200">{opt}</span>
                      {form.correct === opt && (
                        <CheckCircle2 size={16} className="text-green-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.type !== "MULTIPLE_CHOICE" && (
            <div>
              <label className="text-sm text-gray-400">
                Respuesta esperada
              </label>
              <input
                name="correct"
                value={form.correct}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
                placeholder="Texto o expresión esperada"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-gray-300"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              <Save size={14} /> {editingId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {questions.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">
            No hay preguntas registradas.
          </p>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="bg-[#111114] border border-gray-800 rounded-lg p-5 flex justify-between items-start hover:border-purple-600/30 transition"
            >
              <div>
                <h3 className="text-gray-200 font-semibold">
                  {q.order}. {q.text}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Tipo: {q.type} • Puntos: {q.points}
                </p>
                {q.options && (
                  <ul className="mt-2 text-sm text-gray-400 list-disc list-inside">
                    {JSON.parse(q.options).map((opt, i) => (
                      <li key={i}>
                        {opt}{" "}
                        {opt === q.correct && (
                          <span className="text-green-500 font-semibold">
                            (✔ correcta)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(q)}
                  className="text-blue-400 hover:text-blue-500"
                >
                  <Edit2 size={17} />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-red-400 hover:text-red-500"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
