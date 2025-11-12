import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Plus, Trash2, Save, X, Edit2, BookOpen } from "lucide-react";

export default function ModuleExamsPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    timeLimit: 60,
    maxAttempts: 1,
    passingScore: 70,
    published: false,
    availableFrom: "",
    availableTo: "",
  });

  const fetchExams = async () => {
    try {
      const res = await api.get(`/exams/modules/${moduleId}`);
      setExams(res.data);
    } catch (err) {
      console.error("Error al cargar exámenes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [moduleId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("El título es obligatorio.");
      return;
    }
    if (!form.availableFrom || !form.availableTo) {
      alert("Debes establecer fechas de disponibilidad.");
      return;
    }
    try {
      const payload = {
        ...form,
        timeLimit: Number(form.timeLimit),
        maxAttempts: Number(form.maxAttempts),
        passingScore: Number(form.passingScore),
      };
      if (editingId) {
        await api.patch(`/exams/${editingId}`, payload);
      } else {
        await api.post(`/exams/modules/${moduleId}`, {
          ...payload,
          questions: [],
        });
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchExams();
    } catch (err) {
      console.error("Error al guardar examen:", err.response?.data || err);
      alert(err.response?.data?.message || "Error al guardar examen");
    }
  };

  const handleEdit = (exam) => {
    setForm({
      title: exam.title,
      description: exam.description || "",
      timeLimit: exam.timeLimit,
      maxAttempts: exam.maxAttempts,
      passingScore: exam.passingScore,
      published: exam.published,
      availableFrom: exam.availableFrom?.slice(0, 16) || "",
      availableTo: exam.availableTo?.slice(0, 16) || "",
    });
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar examen definitivamente?")) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch {
      alert("Error al eliminar examen");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      timeLimit: 60,
      maxAttempts: 1,
      passingScore: 70,
      published: false,
      availableFrom: "",
      availableTo: "",
    });
  };

  if (loading)
    return <div className="p-6 text-center">Cargando exámenes...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-400">
          Gestión de Exámenes
        </h1>
        <button
          onClick={() => {
            if (showForm && editingId) {
              setEditingId(null);
              resetForm();
            }
            setShowForm(!showForm);
          }}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white flex items-center gap-2"
        >
          <Plus size={16} />
          {showForm ? "Cerrar" : "Nuevo Examen"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#111114] border border-gray-800 p-6 rounded-xl space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Título</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
                placeholder="Ej: Evaluación de Qubits"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">
                Tiempo Límite (min)
              </label>
              <input
                name="timeLimit"
                type="number"
                value={form.timeLimit}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Intentos Máximos</label>
              <input
                name="maxAttempts"
                type="number"
                value={form.maxAttempts}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Puntaje mínimo</label>
              <input
                name="passingScore"
                type="number"
                value={form.passingScore}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100 min-h-[80px]"
              placeholder="Breve descripción del examen..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Disponible desde</label>
              <input
                type="datetime-local"
                name="availableFrom"
                value={form.availableFrom}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Disponible hasta</label>
              <input
                type="datetime-local"
                name="availableTo"
                value={form.availableTo}
                onChange={handleChange}
                className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              className="accent-purple-600"
            />
            <span className="text-sm text-gray-400">Publicado</span>
          </div>

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.length === 0 ? (
          <p className="text-gray-400 text-center">
            No hay exámenes registrados.
          </p>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-[#111114] border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-purple-600/30 transition"
            >
              <div>
                <h2 className="text-lg font-semibold text-purple-300">
                  {exam.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {exam.description || "Sin descripción"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ⏱ {exam.timeLimit} min • Intentos: {exam.maxAttempts}
                </p>
                <p className="text-xs text-gray-500">
                  Nota mínima: {exam.passingScore}%
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => navigate(`/professor/exams/${exam.id}`)}
                  className="text-purple-400 hover:text-purple-500 flex items-center gap-1"
                >
                  <BookOpen size={17} /> Ver preguntas
                </button>
                <button
                  onClick={() => handleEdit(exam)}
                  className="text-blue-400 hover:text-blue-500"
                >
                  <Edit2 size={17} />
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
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
