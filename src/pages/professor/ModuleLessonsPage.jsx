import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import {
  Edit,
  Trash2,
  Loader2,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ModuleLessonsPage() {
  const { moduleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: null,
    title: "",
    content: "",
    type: "TEXT",
    order: 1,
  });

  const fetchLessons = async () => {
    try {
      const res = await api.get(`/lessons/module/${moduleId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setLessons(data);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.content) {
      setError("Completa todos los campos antes de guardar.");
      return;
    }

    const duplicate = lessons.some(
      (l) => Number(l.order) === Number(form.order) && l.id !== form.id
    );

    if (duplicate) {
      setError(`Ya existe una lección con el orden ${form.order}.`);
      return;
    }

    const payload = {
      moduleId: Number(moduleId),
      title: form.title.trim(),
      content: form.content.trim(),
      type: form.type,
      order: Number(form.order),
    };

    try {
      if (form.id) {
        await api.patch(`/lessons/${form.id}`, payload);
      } else {
        await api.post(`/lessons`, payload);
      }
      setForm({ id: null, title: "", content: "", type: "TEXT", order: 1 });
      setError("");
      fetchLessons();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Error al guardar la lección. Revisa los datos.";
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar lección?")) return;
    try {
      await api.delete(`/lessons/${id}`);
      fetchLessons();
    } catch {
      alert("Error al eliminar la lección.");
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [moduleId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Cargando lecciones...
      </div>
    );

  const inputErrorClass = error.includes("orden")
    ? "border-red-500 animate-pulse"
    : "border-gray-700";

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <BookOpen className="text-qt-primary" /> Lecciones del Módulo
        </h1>
        <p className="text-gray-400">
          Gestiona y organiza las lecciones de este módulo.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-10 bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg space-y-5"
      >
        <h2 className="text-xl font-semibold text-white mb-2">
          {form.id ? "Editar Lección" : "Nueva Lección"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Introducción a los Qubits"
              className="w-full bg-[#0b0b0c] border border-gray-700 rounded-lg p-2.5 text-white focus:border-qt-primary outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Orden</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: Number(e.target.value) })
              }
              className={`w-full bg-[#0b0b0c] border ${inputErrorClass} rounded-lg p-2.5 text-white focus:border-qt-primary outline-none transition`}
              placeholder="Ej: 1"
            />
            {error.includes("orden") && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertTriangle size={14} /> {error}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Tipo</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full bg-[#0b0b0c] border border-gray-700 rounded-lg p-2.5 text-white focus:border-qt-primary outline-none transition"
          >
            <option value="TEXT">Texto</option>
            <option value="VIDEO">Video</option>
            <option value="QUIZ">Quiz</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Contenido</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Describe el contenido o conceptos tratados"
            className="w-full bg-[#0b0b0c] border border-gray-700 rounded-lg p-2.5 text-white min-h-[120px] focus:border-qt-primary outline-none transition"
          />
        </div>

        {error && !error.includes("orden") && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto bg-qt-primary text-black font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 flex items-center gap-2 transition"
        >
          <CheckCircle2 size={18} />
          {form.id ? "Actualizar Lección" : "Agregar Lección"}
        </button>
      </form>

      {lessons.length === 0 ? (
        <p className="text-gray-400 text-center mt-12">
          No hay lecciones creadas para este módulo.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((l) => (
            <div
              key={l.id}
              className="bg-[#111114] border border-gray-800 rounded-xl p-5 hover:border-qt-primary/40 transition shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {l.title}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {l.type} • Orden {l.order}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm(l)}
                    className="text-gray-400 hover:text-qt-primary transition"
                  >
                    <Edit size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="text-gray-500 hover:text-red-500 transition"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 line-clamp-4 leading-relaxed">
                {l.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
