import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import { ClipboardList, Edit, Trash2, Loader2 } from "lucide-react";

export default function ProfessorExamsPage() {
  const { moduleId } = useParams();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: null, title: "", description: "" });

  const fetchExams = async () => {
    try {
      const res = await api.get(`/exams/modules/${moduleId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setExams(data);
    } catch {
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    try {
      if (form.id) {
        await api.patch(`/exams/${form.id}`, {
          title: form.title,
          description: form.description,
        });
      } else {
        await api.post(`/exams/modules/${moduleId}`, {
          title: form.title,
          description: form.description,
        });
      }
      setForm({ id: null, title: "", description: "" });
      fetchExams();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar examen?")) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch {}
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Exámenes</h1>
          <p className="text-sm text-gray-400">
            Administra los exámenes del módulo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Título del examen"
          className="w-full bg-transparent border border-gray-700 rounded p-2 text-white"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descripción o instrucciones"
          className="w-full bg-transparent border border-gray-700 rounded p-2 text-white min-h-[100px]"
        />
        <button
          type="submit"
          className="bg-qt-primary text-black font-semibold px-4 py-2 rounded hover:opacity-90"
        >
          {form.id ? "Actualizar" : "Agregar Examen"}
        </button>
      </form>

      {exams.length === 0 ? (
        <p className="text-gray-400 text-center mt-12">
          No hay exámenes creados.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((e) => (
            <div
              key={e.id}
              className="bg-[#111114] border border-gray-800 rounded-xl p-5 hover:border-qt-primary/40 transition shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-white">{e.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm(e)}
                    className="text-gray-400 hover:text-qt-primary"
                  >
                    <Edit size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 line-clamp-3">
                {e.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
