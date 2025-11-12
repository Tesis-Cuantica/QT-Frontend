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
      setLoading(true);
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
      setLoading(true);
      const res = await api.get(`/attempts/${id}`);
      setSelected(res.data);
      setForm({
        score: res.data.score || "",
        feedback: res.data.feedback || "",
      });
    } catch (err) {
      console.error("Error al obtener intento:", err);
    } finally {
      setLoading(false);
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
    if (!selected) {
      fetchAttempts();
    }
  }, [selected]);

  if (loading && !selected)
    return (
      <div className="p-6 text-center text-zinc-400 flex justify-center items-center gap-2">
        <Loader2 className="animate-spin" size={20} /> Cargando intentos...
      </div>
    );

  if (selected)
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft size={18} /> Volver a la lista
        </button>

        <h1 className="text-2xl font-bold text-purple-400">
          Calificar intento #{selected.id}
        </h1>

        <div className="bg-[#111114] border border-zinc-800 rounded-lg p-5 space-y-3">
          <p className="text-zinc-100">
            <strong>Estudiante:</strong> {selected.student?.name}
          </p>
          <p className="text-zinc-100">
            <strong>Examen:</strong> {selected.exam?.title}
          </p>
          <p className="text-zinc-400 text-sm">
            <strong>Estado actual:</strong>{" "}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                selected.status === "SUBMITTED"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : selected.status === "GRADED"
                  ? "bg-green-500/20 text-green-300"
                  : "bg-zinc-700/50 text-zinc-300"
              }`}
            >
              {selected.status}
            </span>
          </p>
          <p className="text-zinc-500 text-sm">
            <strong>Enviado:</strong>{" "}
            {new Date(selected.submittedAt).toLocaleString()}
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-center text-zinc-400 flex justify-center items-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Cargando detalle...
          </div>
        ) : (
          <form
            onSubmit={handleGrade}
            className="bg-[#111114] border border-zinc-800 rounded-lg p-6 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-2 block">
                Puntaje
              </label>
              <input
                type="number"
                name="score"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: 85"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-2 block">
                Retroalimentación
              </label>
              <textarea
                name="feedback"
                value={form.feedback}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Comentarios para el estudiante..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-zinc-100 font-medium transition-colors"
              >
                <X size={16} /> Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                <Save size={16} /> Guardar Calificación
              </button>
            </div>
          </form>
        )}
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-purple-400">
        Intentos de Exámenes
      </h1>

      {attempts.length === 0 && !loading ? (
        <div className="bg-[#111114] border border-zinc-800 rounded-lg p-10 text-center">
          <p className="text-zinc-400">No hay intentos registrados aún.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-[#111114]">
          <table className="w-full min-w-[700px] text-sm text-left text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs text-zinc-400 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Estudiante
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Examen
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Puntaje
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 font-medium text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {attempts.map((a) => (
                <tr key={a.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {a.student?.name}
                  </td>
                  <td className="px-4 py-3">{a.exam?.title}</td>
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {a.score !== null ? `${a.score}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === "GRADED"
                          ? "bg-green-500/20 text-green-300"
                          : a.status === "SUBMITTED"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-zinc-700/50 text-zinc-300"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => fetchAttemptDetail(a.id)}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye size={17} />
                      </button>
                      {a.status === "SUBMITTED" && (
                        <button
                          onClick={() => fetchAttemptDetail(a.id)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Calificar"
                        >
                          <Edit3 size={17} />
                        </button>
                      )}
                      {a.status === "GRADED" && (
                        <CheckCircle
                          size={17}
                          className="text-green-500"
                          title="Calificado"
                        />
                      )}
                      {a.status === "IN_PROGRESS" && (
                        <XCircle
                          size={17}
                          className="text-zinc-500"
                          title="En Progreso"
                        />
                      )}
                    </div>
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
