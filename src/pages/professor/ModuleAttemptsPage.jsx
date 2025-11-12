import { useEffect, useState } from "react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Edit3,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";

export default function ModuleAttemptsPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ score: "", feedback: "" });
  const navigate = useNavigate();

  const fetchAttempts = async () => {
    try {
      const res = await api.get("/attempts");
      setAttempts(res.data);
    } catch (err) {
      console.error("Error al cargar intentos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptDetail = async (id) => {
    try {
      const res = await api.get(`/attempts/${id}`);
      setSelected(res.data);
      setForm({
        score: res.data.score || "",
        feedback: res.data.feedback || "",
      });
    } catch (err) {
      console.error("Error al obtener intento:", err);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!form.score) {
      alert("Debes ingresar una nota.");
      return;
    }
    try {
      await api.patch(`/attempts/${selected.id}`, {
        score: Number(form.score),
        feedback: form.feedback,
        status: "GRADED",
      });
      alert("✅ Calificación guardada con éxito.");
      setSelected(null);
      fetchAttempts();
    } catch (err) {
      console.error("Error al calificar intento:", err);
      alert("Error al guardar calificación.");
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-center text-gray-400 flex justify-center">
        <Loader2 className="animate-spin" size={24} /> Cargando intentos...
      </div>
    );

  if (selected)
    return (
      <div className="p-6 space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <h1 className="text-2xl font-bold text-purple-400">
          Calificar intento #{selected.id}
        </h1>

        <div className="bg-[#111114] border border-gray-800 rounded-xl p-5 space-y-3">
          <p className="text-gray-300">
            <strong>Estudiante:</strong> {selected.student?.name}
          </p>
          <p className="text-gray-300">
            <strong>Examen:</strong> {selected.exam?.title}
          </p>
          <p className="text-gray-400 text-sm">
            <strong>Estado actual:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-xs ${
                selected.status === "SUBMITTED"
                  ? "bg-yellow-600/30 text-yellow-400"
                  : selected.status === "GRADED"
                  ? "bg-green-600/30 text-green-400"
                  : "bg-gray-700/50 text-gray-400"
              }`}
            >
              {selected.status}
            </span>
          </p>
          <p className="text-gray-500 text-sm">
            <strong>Enviado:</strong>{" "}
            {new Date(selected.submittedAt).toLocaleString()}
          </p>
        </div>

        <form
          onSubmit={handleGrade}
          className="bg-[#111114] border border-gray-800 rounded-xl p-6 space-y-4"
        >
          <div>
            <label className="text-sm text-gray-400">Puntaje</label>
            <input
              type="number"
              name="score"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
              placeholder="Ej: 85"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Retroalimentación</label>
            <textarea
              name="feedback"
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-100 min-h-[80px]"
              placeholder="Comentarios para el estudiante..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-gray-300"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              <Save size={14} /> Guardar Calificación
            </button>
          </div>
        </form>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-purple-400">
        Intentos de Exámenes
      </h1>

      {attempts.length === 0 ? (
        <p className="text-gray-400 text-center">
          No hay intentos registrados aún.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-[#1a1a1d] text-gray-300 text-sm">
              <tr>
                <th className="p-3 text-left">Estudiante</th>
                <th className="p-3 text-left">Examen</th>
                <th className="p-3 text-left">Puntaje</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-gray-800 hover:bg-[#151518]/70 transition"
                >
                  <td className="p-3">{a.student?.name}</td>
                  <td className="p-3">{a.exam?.title}</td>
                  <td className="p-3 text-gray-300">
                    {a.score !== null ? `${a.score}` : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        a.status === "GRADED"
                          ? "bg-green-600/30 text-green-400"
                          : a.status === "SUBMITTED"
                          ? "bg-yellow-600/30 text-yellow-400"
                          : "bg-gray-700/50 text-gray-400"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => fetchAttemptDetail(a.id)}
                      className="text-purple-400 hover:text-purple-500"
                    >
                      <Eye size={17} />
                    </button>
                    {a.status === "SUBMITTED" && (
                      <button
                        onClick={() => fetchAttemptDetail(a.id)}
                        className="text-green-400 hover:text-green-500"
                      >
                        <Edit3 size={17} />
                      </button>
                    )}
                    {a.status === "GRADED" && (
                      <CheckCircle size={17} className="text-green-500" />
                    )}
                    {a.status === "IN_PROGRESS" && (
                      <XCircle size={17} className="text-gray-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
