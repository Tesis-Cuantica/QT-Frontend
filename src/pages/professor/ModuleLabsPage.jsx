import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import {
  FlaskRound,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ModuleLabsPage() {
  const { moduleId } = useParams();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    circuitJSON: "",
    correctResult: "",
    order: 1,
  });

  const fetchLabs = async () => {
    try {
      const res = await api.get(`/labs/modules/${moduleId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setLabs(data);
    } catch {
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.description || !form.circuitJSON) {
      setError("Completa todos los campos requeridos antes de guardar.");
      return;
    }

    const duplicate = labs.some(
      (l) => Number(l.order) === Number(form.order) && l.id !== form.id
    );
    if (duplicate) {
      setError(`Ya existe un laboratorio con el orden ${form.order}.`);
      return;
    }

    const payload = {
      moduleId: Number(moduleId),
      title: form.title.trim(),
      description: form.description.trim(),
      circuitJSON: form.circuitJSON.trim(),
      correctResult: form.correctResult.trim(),
      order: Number(form.order),
    };

    try {
      if (form.id) {
        await api.patch(`/labs/${form.id}`, payload);
      } else {
        await api.post(`/labs`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }
      setForm({
        id: null,
        title: "",
        description: "",
        circuitJSON: "",
        correctResult: "",
        order: 1,
      });
      fetchLabs();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Error al guardar el laboratorio. Revisa los datos.";
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar laboratorio?")) return;
    try {
      await api.delete(`/labs/${id}`);
      fetchLabs();
    } catch {
      alert("Error al eliminar laboratorio.");
    }
  };

  useEffect(() => {
    fetchLabs();
  }, [moduleId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Cargando laboratorios...
      </div>
    );

  const inputErrorClass = error.includes("orden")
    ? "border-red-500 animate-pulse"
    : "border-gray-700";

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <FlaskRound className="text-qt-primary" /> Laboratorios del Módulo
        </h1>
        <p className="text-gray-400">
          Diseña y gestiona laboratorios con simulaciones cuánticas.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-10 bg-[#111114] border border-gray-800 rounded-xl p-6 shadow-lg space-y-5"
      >
        <h2 className="text-xl font-semibold text-white mb-2">
          {form.id ? "Editar Laboratorio" : "Nuevo Laboratorio"}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Generar estado de Bell"
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
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Descripción
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe el propósito del laboratorio..."
            className="w-full bg-[#0b0b0c] border border-gray-700 rounded-lg p-2.5 text-white min-h-[80px] focus:border-qt-primary outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Circuito (JSON)
          </label>
          <textarea
            value={form.circuitJSON}
            onChange={(e) => setForm({ ...form, circuitJSON: e.target.value })}
            placeholder='Ej: {"qubits":2,"gates":[{"type":"H","qubit":0},{"type":"CNOT","control":0,"target":1}]}'
            className="w-full bg-[#0b0b0c] border border-gray-700 rounded-lg p-2.5 text-white min-h-[80px] font-mono text-sm focus:border-qt-primary outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Resultado Correcto (JSON)
          </label>
          <textarea
            value={form.correctResult}
            onChange={(e) =>
              setForm({ ...form, correctResult: e.target.value })
            }
            placeholder='Ej: {"statevector":[0.7071,0,0,0.7071]}'
            className="w-full bg-[#0b0b0c] border border-gray-700 rounded-lg p-2.5 text-white min-h-[80px] font-mono text-sm focus:border-qt-primary outline-none transition"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto bg-qt-primary text-black font-semibold px-6 py-2.5 rounded-lg hover:opacity-90 flex items-center gap-2 transition"
        >
          <CheckCircle2 size={18} />
          {form.id ? "Actualizar Laboratorio" : "Agregar Laboratorio"}
        </button>
      </form>

      {labs.length === 0 ? (
        <p className="text-gray-400 text-center mt-12">
          No hay laboratorios creados para este módulo.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="bg-[#111114] border border-gray-800 rounded-xl p-5 hover:border-qt-primary/40 transition shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-white">
                  {lab.title}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm(lab)}
                    className="text-gray-400 hover:text-qt-primary"
                  >
                    <Edit size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(lab.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 line-clamp-3">
                {lab.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
