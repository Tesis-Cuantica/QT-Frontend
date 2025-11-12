import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import {
  FlaskConical,
  Loader2,
  Play,
  FileText,
  Cpu,
  CheckCircle2,
} from "lucide-react";

export default function StudentLabsPage() {
  const { moduleId } = useParams();
  const [labs, setLabs] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [selectedLab, setSelectedLab] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchLabs = async () => {
    try {
      const res = await api.get(`/labs/modules/${moduleId}`);
      const data = res.data;

      setModuleInfo(data.module || null);
      setLabs(data.labs || []);
      if (data.labs && data.labs.length > 0) {
        setSelectedLab(data.labs[0]);
      }
    } catch (err) {
      console.error("Error al cargar laboratorios:", err);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!selectedLab?.circuitJSON) return alert("No hay circuito definido.");
    setSimulating(true);
    try {
      const res = await api.post("/labs/simulate", {
        circuitJSON: selectedLab.circuitJSON,
      });
      setSimulationResult(res.data);
    } catch (err) {
      console.error("Error al simular laboratorio:", err);
      alert("No se pudo ejecutar la simulación.");
    } finally {
      setSimulating(false);
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

  if (labs.length === 0)
    return (
      <div className="p-6 text-center text-gray-400">
        No hay laboratorios disponibles en este módulo.
      </div>
    );

  return (
    <div className="p-6 grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Sidebar con lista de labs */}
      <aside className="bg-[#111114] border border-gray-800 rounded-xl p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-purple-400 mb-4">
          {moduleInfo ? moduleInfo.title : "Módulo"}
        </h2>

        <ul className="space-y-2">
          {labs.map((lab) => (
            <li
              key={lab.id}
              onClick={() => {
                setSelectedLab(lab);
                setSimulationResult(null);
              }}
              className={`p-3 rounded-md cursor-pointer flex items-center gap-2 transition ${
                selectedLab?.id === lab.id
                  ? "bg-pink-600/20 border border-pink-600/30 text-pink-300"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <FlaskConical size={16} />
              <span className="text-sm">{lab.title}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Contenido del laboratorio */}
      <section className="bg-[#111114] border border-gray-800 rounded-xl p-6 space-y-6">
        {selectedLab ? (
          <>
            <h2 className="text-xl font-bold text-gray-100">
              {selectedLab.title}
            </h2>
            <p className="text-gray-400">{selectedLab.description}</p>

            <div className="mt-4">
              <h3 className="text-sm text-purple-400 font-semibold mb-2">
                Circuito Cuántico
              </h3>
              <pre className="bg-black/40 border border-gray-700 rounded-lg p-3 text-xs text-gray-400 overflow-x-auto">
                {selectedLab.circuitJSON}
              </pre>
            </div>

            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 border border-pink-600/40 rounded-md text-pink-300 hover:bg-pink-600/30 transition disabled:opacity-50"
            >
              {simulating ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Cpu size={16} />
              )}
              {simulating ? "Simulando..." : "Ejecutar simulación"}
            </button>

            {/* Resultado de simulación */}
            {simulationResult && (
              <div className="mt-5 bg-black/30 border border-gray-700 rounded-lg p-4 text-gray-300">
                <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Resultado de la simulación
                </h4>
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(simulationResult, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400">Selecciona un laboratorio para verlo.</p>
        )}
      </section>
    </div>
  );
}
