import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Copy,
  Plus,
  Minus,
  Play,
  Undo,
  Redo,
  Save,
  Download,
  Zap,
  CircleDot,
  ArrowRightLeft,
  Ruler,
  PanelLeft,
  PanelRight,
  ChevronDown,
  X as RemoveIcon,
  Eraser,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const sqrt2 = Math.sqrt(2);

const complex = (re, im = 0) => ({ re, im });
const multiplyComplex = (a, b) => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const addComplex = (a, b) => ({
  re: a.re + b.re,
  im: a.im + b.im,
});
const magnitudeSq = (c) => c.re * c.re + c.im * c.im;

const GATE_MATRIX = {
  H: [
    [complex(1 / sqrt2), complex(1 / sqrt2)],
    [complex(1 / sqrt2), complex(-1 / sqrt2)],
  ],
  X: [
    [complex(0), complex(1)],
    [complex(1), complex(0)],
  ],
  Y: [
    [complex(0), complex(0, -1)],
    [complex(0, 1), complex(0)],
  ],
  Z: [
    [complex(1), complex(0)],
    [complex(0), complex(-1)],
  ],
  S: [
    [complex(1), complex(0)],
    [complex(0), complex(0, 1)],
  ],
  T: [
    [complex(1), complex(0)],
    [complex(0), complex(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))],
  ],
};

const applyGateToState = (state, n, gate, targetQubit) => {
  const size = 1 << n;
  const newState = Array(size)
    .fill(null)
    .map(() => complex(0));

  for (let x = 0; x < size; x++) {
    const bit = (x >> targetQubit) & 1;
    for (let a = 0; a < 2; a++) {
      const y = (x & ~(1 << targetQubit)) | (a << targetQubit);
      const product = multiplyComplex(gate[a][bit], state[x]);
      newState[y] = addComplex(newState[y], product);
    }
  }
  return newState;
};

const applyCNOT = (state, n, controlQubit, targetQubit) => {
  const size = 1 << n;
  const newState = state.map((s) => ({ ...s }));
  for (let x = 0; x < size; x++) {
    if ((x >> controlQubit) & 1) {
      const y = x ^ (1 << targetQubit);
      newState[y] = state[x];
      newState[x] = state[y];
    }
  }
  return newState;
};

const applySWAP = (state, n, qubitA, qubitB) => {
  const size = 1 << n;
  const newState = Array(size)
    .fill(null)
    .map(() => complex(0));
  for (let x = 0; x < size; x++) {
    const bitA = (x >> qubitA) & 1;
    const bitB = (x >> qubitB) & 1;
    const y = x ^ ((bitA ^ bitB) << qubitA) ^ ((bitA ^ bitB) << qubitB);
    newState[y] = state[x];
  }
  return newState;
};

const simulateQuantumCircuit = (qubits, gates) => {
  const n = qubits;
  const size = 1 << n;
  let state = Array(size)
    .fill(null)
    .map((_, i) => (i === 0 ? complex(1) : complex(0)));

  const depthMap = gates.reduce((map, g) => {
    (map[g.depth] = map[g.depth] || []).push(g);
    return map;
  }, {});

  const depths = Object.keys(depthMap)
    .map(Number)
    .sort((a, b) => a - b);
  for (let d of depths) {
    const layer = depthMap[d];
    const processed = Array(layer.length).fill(false);

    for (let i = 0; i < layer.length; i++) {
      if (processed[i]) continue;
      const gate = layer[i];

      if (gate.type === "CNOT") {
        const target = layer.find(
          (g, j) => !processed[j] && g.type === "CNOT" && g.qubit !== gate.qubit
        );
        if (target) {
          const control = gate.qubit < target.qubit ? gate.qubit : target.qubit;
          const tgt = gate.qubit > target.qubit ? gate.qubit : target.qubit;
          state = applyCNOT(state, n, control, tgt);
          processed[i] = true;
          const j = layer.indexOf(target);
          processed[j] = true;
        }
      } else if (gate.type === "SWAP") {
        const other = layer.find(
          (g, j) => !processed[j] && g.type === "SWAP" && g.qubit !== gate.qubit
        );
        if (other) {
          state = applySWAP(state, n, gate.qubit, other.qubit);
          processed[i] = true;
          const j = layer.indexOf(other);
          processed[j] = true;
        }
      } else if (GATE_MATRIX[gate.type]) {
        state = applyGateToState(state, n, GATE_MATRIX[gate.type], gate.qubit);
        processed[i] = true;
      }
    }
  }

  const probabilities = state.map((amp) => magnitudeSq(amp));
  const total = probabilities.reduce((sum, p) => sum + p, 0);
  const normalizedProbs =
    total > 0 ? probabilities.map((p) => p / total) : probabilities;
  const statevector = state.map((amp) => magnitudeSq(amp));

  return {
    statevector,
    probabilities: normalizedProbs,
    qubitStates: calculateQubitStates(state, n),
  };
};

const calculateQubitStates = (state, n) => {
  return Array.from({ length: n }, (_, q) => {
    let prob0 = 0,
      prob1 = 0;
    for (let i = 0; i < state.length; i++) {
      const bit = (i >> q) & 1;
      const prob = magnitudeSq(state[i]);
      if (bit === 0) prob0 += prob;
      else prob1 += prob;
    }
    const total = prob0 + prob1 || 1;
    prob0 /= total;
    prob1 /= total;

    let label = "|0⟩";
    if (prob1 > 0.95) label = "|1⟩";
    else if (Math.abs(prob0 - 0.5) < 0.1 && Math.abs(prob1 - 0.5) < 0.1)
      label = "|+⟩";
    else label = `α|0⟩ + β|1⟩`;

    return {
      state: label,
      prob1: prob1 * 100,
      prob0: prob0 * 100,
    };
  });
};

// --- Componente Principal Mejorado ---
export default function QuantumLabDesigner() {
  const [qubits, setQubits] = useState(3);
  const [gates, setGates] = useState([]);
  const [depth, setDepth] = useState(8);
  const [copied, setCopied] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [circuitName, setCircuitName] = useState("Quantum Entanglement");

  // Nuevos estados para la interfaz mejorada
  const [selectedGate, setSelectedGate] = useState(null);
  const [firstQubitForMulti, setFirstQubitForMulti] = useState(null);
  const [activePanel, setActivePanel] = useState("design");
  const [zoomLevel, setZoomLevel] = useState(80); // Por defecto más compacto
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false); // Nuevo estado para modo eliminación

  const saveToHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev.map((x) => ({ ...x })),
      { qubits, gates: [...gates], depth, circuitName },
    ]);
    setFuture([]);
  }, [qubits, gates, depth, circuitName]);

  useEffect(() => {
    // Cargar circuito de ejemplo por defecto
    const exampleCircuit = {
      qubits: 3,
      depth: 8,
      name: "Quantum Entanglement",
      gates: [
        { type: "H", qubit: 0, depth: 0 },
        { type: "CNOT", qubit: 0, depth: 1 },
        { type: "CNOT", qubit: 1, depth: 1 },
        { type: "H", qubit: 1, depth: 2 },
        { type: "CNOT", qubit: 1, depth: 3 },
        { type: "CNOT", qubit: 2, depth: 3 },
        { type: "MEASURE", qubit: 0, depth: 7 },
        { type: "MEASURE", qubit: 1, depth: 7 },
        { type: "MEASURE", qubit: 2, depth: 7 },
      ],
    };
    setQubits(exampleCircuit.qubits);
    setDepth(exampleCircuit.depth);
    setCircuitName(exampleCircuit.name);
    setGates(exampleCircuit.gates);
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture((prev) => [
      ...prev,
      { qubits, gates: [...gates], depth, circuitName },
    ]);
    setHistory((prev) => prev.slice(0, -1));
    setQubits(previous.qubits);
    setGates(previous.gates);
    setDepth(previous.depth);
    setCircuitName(previous.circuitName);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setHistory((prev) => [
      ...prev,
      { qubits, gates: [...gates], depth, circuitName },
    ]);
    setFuture((prev) => prev.slice(0, -1));
    setQubits(next.qubits);
    setGates(next.gates);
    setDepth(next.depth);
    setCircuitName(next.circuitName);
  };

  const handleClickCell = (qubit, d) => {
    if (deleteMode) {
      // Modo eliminación
      removeGate(qubit, d);
      return;
    }

    if (!selectedGate) return;

    if (selectedGate === "CNOT" || selectedGate === "SWAP") {
      if (firstQubitForMulti === null) {
        // First qubit selection for multi-qubit gate
        setFirstQubitForMulti({ qubit, depth: d });
      } else {
        // Second qubit selection
        if (firstQubitForMulti.qubit === qubit) {
          setErrorMsg(`Cannot place ${selectedGate} on the same qubit.`);
          setTimeout(() => setErrorMsg(""), 3000);
          setFirstQubitForMulti(null);
          return;
        }

        // Use the depth of the first selection for both gates
        const depthToUse = firstQubitForMulti.depth;

        saveToHistory();
        setGates((prev) => {
          // Remove any existing gates of the same type at this depth for these two qubits
          let newGates = prev.filter(
            (g) =>
              !(
                g.depth === depthToUse &&
                g.type === selectedGate &&
                (g.qubit === firstQubitForMulti.qubit || g.qubit === qubit)
              )
          );

          // Add the two new gates
          newGates = [
            ...newGates,
            {
              type: selectedGate,
              qubit: firstQubitForMulti.qubit,
              depth: depthToUse,
            },
            { type: selectedGate, qubit: qubit, depth: depthToUse },
          ];
          return newGates;
        });

        // Reset states
        setFirstQubitForMulti(null);
        setSelectedGate(null);
      }
    } else {
      // Single qubit gate
      saveToHistory();
      setGates((prev) => {
        // Remove any existing gate at this qubit and depth
        let newGates = prev.filter(
          (g) => !(g.qubit === qubit && g.depth === d)
        );
        // Add the new gate
        newGates.push({ type: selectedGate, qubit: qubit, depth: d });
        return newGates;
      });

      // Keep the gate selected for placing more
    }
  };

  const handleSelectGate = (gateType) => {
    // Toggle selection if already selected
    setSelectedGate((prev) => (prev === gateType ? null : gateType));
    setFirstQubitForMulti(null); // Reset multi-qubit selection
    setDeleteMode(false); // Salir del modo eliminación
  };

  const toggleDeleteMode = () => {
    setDeleteMode((prev) => !prev);
    setSelectedGate(null); // Desseleccionar cualquier compuerta
    setFirstQubitForMulti(null); // Reset multi-qubit selection
  };

  const removeGate = (q, d) => {
    // Verificar si hay una compuerta en esta posición
    const gateToRemove = gates.find((g) => g.qubit === q && g.depth === d);
    if (!gateToRemove) return;

    // Si es una compuerta multi-qubit (CNOT o SWAP), eliminar también su pareja
    if (gateToRemove.type === "CNOT" || gateToRemove.type === "SWAP") {
      const pairedGate = gates.find(
        (g) => g.type === gateToRemove.type && g.depth === d && g.qubit !== q
      );

      if (pairedGate) {
        saveToHistory();
        setGates((prev) =>
          prev.filter((g) => !(g.depth === d && g.type === gateToRemove.type))
        );
        return;
      }
    }

    // Para compuertas normales
    saveToHistory();
    setGates((prev) => prev.filter((g) => !(g.qubit === q && g.depth === d)));
  };

  const removeGateDirectly = (q, d) => {
    // Esta función se llama directamente desde el botón de eliminar en la celda
    removeGate(q, d);
  };

  const clearAll = () => {
    saveToHistory();
    setGates([]);
    setSimulation(null);
    setErrorMsg("");
    setCircuitName("Untitled Circuit");
    setSelectedGate(null);
    setFirstQubitForMulti(null);
    setDeleteMode(false);
  };

  const circuitJSON = useMemo(
    () => JSON.stringify({ qubits, gates, depth, name: circuitName }, null, 2),
    [qubits, gates, depth, circuitName]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(circuitJSON);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setErrorMsg("Error al copiar al portapapeles");
    }
  };

  const handleSimulate = async () => {
    if (gates.length === 0) {
      setErrorMsg("Por favor, agregue al menos una compuerta para simular.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const result = simulateQuantumCircuit(qubits, gates);
      setSimulation(result);
      setActivePanel("simulation");
    } catch (err) {
      setErrorMsg(`Error en simulación: ${err.message || "Desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    try {
      const data = JSON.stringify({ qubits, gates, depth, name: circuitName });
      localStorage.setItem("quantum_circuit", data);
      setErrorMsg("✅ Circuito guardado localmente.");
      setTimeout(() => setErrorMsg(""), 3000);
    } catch (e) {
      setErrorMsg("❌ Error al guardar: " + (e.message || ""));
    }
  };

  const handleLoad = () => {
    try {
      const data = localStorage.getItem("quantum_circuit");
      if (data) {
        const parsed = JSON.parse(data);
        saveToHistory();
        setQubits(parsed.qubits || 3);
        setGates(parsed.gates || []);
        setDepth(parsed.depth || 8);
        setCircuitName(parsed.name || "Loaded Circuit");
        setErrorMsg("✅ Circuito cargado.");
        setTimeout(() => setErrorMsg(""), 3000);
      } else {
        setErrorMsg("⚠️ No hay circuito guardado.");
      }
    } catch (e) {
      setErrorMsg("❌ Error al cargar: " + (e.message || ""));
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(
      { qubits, gates, depth, name: circuitName },
      null,
      2
    );
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const link = document.createElement("a");
    link.href = dataUri;
    link.download = `${circuitName.replace(/\s+/g, "_") || "circuit"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderGate = (gate, q, d) => {
    if (!gate)
      return (
        <span className="text-gray-400 text-xs flex items-center justify-center h-full">
          |0⟩
        </span>
      );

    const commonClasses =
      "w-full h-full flex items-center justify-center rounded font-bold text-xs border relative";

    const renderDeleteButton = () => (
      <button
        onClick={(e) => {
          e.stopPropagation(); // Evitar que se active handleClickCell
          removeGateDirectly(q, d);
        }}
        className="absolute -top-1 -right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-0.5 shadow-sm z-10"
        title="Eliminar compuerta"
      >
        <RemoveIcon size={12} className="text-white" />
      </button>
    );

    switch (gate.type) {
      case "H":
        return (
          <div
            className={`${commonClasses} bg-purple-600/20 text-purple-300 border-purple-500/30`}
          >
            {renderDeleteButton()}H
          </div>
        );
      case "X":
        return (
          <div
            className={`${commonClasses} bg-red-600/20 text-red-300 border-red-500/30`}
          >
            {renderDeleteButton()}X
          </div>
        );
      case "Y":
        return (
          <div
            className={`${commonClasses} bg-yellow-600/20 text-yellow-300 border-yellow-500/30`}
          >
            {renderDeleteButton()}Y
          </div>
        );
      case "Z":
        return (
          <div
            className={`${commonClasses} bg-blue-600/20 text-blue-300 border-blue-500/30`}
          >
            {renderDeleteButton()}Z
          </div>
        );
      case "S":
        return (
          <div
            className={`${commonClasses} bg-cyan-600/20 text-cyan-300 border-cyan-500/30`}
          >
            {renderDeleteButton()}S
          </div>
        );
      case "T":
        return (
          <div
            className={`${commonClasses} bg-teal-600/20 text-teal-300 border-teal-500/30`}
          >
            {renderDeleteButton()}T
          </div>
        );
      case "MEASURE":
        return (
          <div
            className={`${commonClasses} bg-pink-600/20 text-pink-300 border-pink-500/30`}
          >
            {renderDeleteButton()}
            <Ruler size={14} />
          </div>
        );
      case "CNOT":
        const pair = gates.find(
          (g) => g.type === "CNOT" && g.depth === d && g.qubit !== q
        );
        if (!pair) return null;

        const isControl = q < pair.qubit;
        if (isControl) {
          return (
            <div className="relative w-full h-full flex items-center justify-center">
              {renderDeleteButton()}
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
          );
        } else {
          return (
            <div className="relative w-full h-full flex items-center justify-center">
              {renderDeleteButton()}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-0.5 bg-purple-500 absolute top-1/2 -translate-y-1/2"></div>
                <div className="w-4 h-4 border-2 border-purple-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </div>
          );
        }
      case "SWAP":
        const otherSwap = gates.find(
          (g) => g.type === "SWAP" && g.depth === d && g.qubit !== q
        );
        if (!otherSwap) return null;
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {renderDeleteButton()}
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-black font-bold">
              <ArrowRightLeft size={12} />
            </div>
          </div>
        );
      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {renderDeleteButton()}
            <span className="text-gray-400">{gate.type}</span>
          </div>
        );
    }
  };

  // Preparar datos para el gráfico de barras
  const chartData = useMemo(() => {
    if (!simulation) return [];
    return simulation.probabilities
      .map((prob, index) => {
        const state = index.toString(2).padStart(qubits, "0");
        return {
          state: `|${state}⟩`,
          probability: prob * 100,
          amplitude: Math.sqrt(simulation.statevector[index]),
        };
      })
      .filter((data) => data.probability > 0.1); // Filtrar estados con probabilidad muy baja
  }, [simulation, qubits]);

  // Determinar el ancho de cada columna del circuito según el nivel de zoom
  const cellWidth = useMemo(() => {
    const baseWidth = 60; // Base más compacta
    return (baseWidth * zoomLevel) / 100;
  }, [zoomLevel]);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-200 font-sans overflow-hidden">
      <header className="bg-gradient-to-r from-gray-900 to-purple-900/20 border-b border-purple-900/30 py-2 px-3 md:px-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-800/50 transition"
              title={sidebarOpen ? "Ocultar panel" : "Mostrar panel"}
            >
              {sidebarOpen ? (
                <PanelLeft size={20} className="text-purple-400" />
              ) : (
                <PanelRight size={20} className="text-purple-400" />
              )}
            </button>
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent flex items-center">
              <Zap className="mr-2" size={20} md:size={24} />
              <span className="hidden xs:inline">Quantum Lab</span>
            </h1>
          </div>

          <div className="flex bg-gray-800/50 rounded-lg p-0.5 text-xs sm:text-sm">
            <button
              onClick={() => setActivePanel("design")}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md flex items-center transition ${
                activePanel === "design"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <PanelLeft className="mr-1" size={14} md:size={16} />
              <span className="hidden sm:inline">Diseño</span>
            </button>
            <button
              onClick={() => setActivePanel("simulation")}
              disabled={!simulation}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md flex items-center transition ${
                activePanel === "simulation"
                  ? "bg-blue-600 text-white shadow-sm"
                  : simulation
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-500 cursor-not-allowed"
              }`}
            >
              <Zap className="mr-1" size={14} md:size={16} />
              <span className="hidden sm:inline">Simulación</span>
              <span className="sm:hidden">Resultados</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
          <div className="flex items-center bg-gray-800/50 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-1 rounded-md hover:bg-gray-700 transition"
              title="Reducir zoom"
            >
              <Minus size={14} md:size={16} className="text-gray-300" />
            </button>
            <span className="mx-1 text-xs sm:text-sm font-medium text-purple-300 min-w-[35px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              className="p-1 rounded-md hover:bg-gray-700 transition"
              title="Aumentar zoom"
            >
              <Plus size={14} md:size={16} className="text-gray-300" />
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs sm:text-sm">
            <div className="flex items-center">
              <span className="text-gray-400 mr-0.5 sm:mr-1">Q:</span>
              <span className="text-purple-400 font-bold bg-purple-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm">
                {qubits}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-0.5 sm:mr-1">G:</span>
              <span className="text-blue-400 font-bold bg-blue-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm">
                {gates.length}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 mr-0.5 sm:mr-1">D:</span>
              <span className="text-cyan-400 font-bold bg-cyan-900/30 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm">
                {depth}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              title="Deshacer"
              className="p-1 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Undo size={16} md:size={18} className="text-gray-300" />
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              title="Rehacer"
              className="p-1 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Redo size={16} md:size={18} className="text-gray-300" />
            </button>
            <button
              onClick={handleSave}
              title="Guardar"
              className="p-1 rounded-lg hover:bg-gray-800 transition"
            >
              <Save size={16} md:size={18} className="text-gray-300" />
            </button>
            <button
              onClick={handleLoad}
              title="Cargar"
              className="p-1 rounded-lg hover:bg-gray-800 transition"
            >
              <Download size={16} md:size={18} className="text-gray-300" />
            </button>
          </div>

          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="p-1 rounded-lg hover:bg-gray-800/50 transition"
            title={
              rightPanelOpen ? "Ocultar panel derecho" : "Mostrar panel derecho"
            }
          >
            {rightPanelOpen ? (
              <PanelRight size={18} md:size={20} className="text-purple-400" />
            ) : (
              <PanelLeft size={18} md:size={20} className="text-purple-400" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden bg-gray-950/50">
        {/* Panel izquierdo - Configuración y compuertas */}
        <div
          className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 overflow-y-auto ${
            sidebarOpen ? "w-64 md:w-72 lg:w-80 shrink-0" : "w-0"
          } ${sidebarOpen ? "block" : "hidden md:block"}`}
        >
          <div className="p-3 md:p-4 space-y-4 h-full">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center">
                  <MousePointerClick
                    className="mr-1.5"
                    size={16}
                    md:size={18}
                  />
                  <span className="hidden sm:inline">Modo de interacción</span>
                  <span className="sm:hidden">Interacción</span>
                </h3>
                {(selectedGate || firstQubitForMulti) && (
                  <button
                    onClick={() => {
                      setSelectedGate(null);
                      setFirstQubitForMulti(null);
                    }}
                    className="text-xs bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded hover:bg-red-500/30 transition flex items-center"
                  >
                    <X size={14} className="mr-0.5" />
                    <span className="hidden xs:inline">Cancelar</span>
                  </button>
                )}
              </div>

              <div className="bg-gray-800/50 rounded-xl p-2.5 md:p-3">
                <div className="flex items-center mb-2">
                  {selectedGate ? (
                    <div className="flex items-center space-x-1.5 md:space-x-2">
                      <div
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${
                          selectedGate === "CNOT" || selectedGate === "SWAP"
                            ? "bg-indigo-900/60 text-indigo-300 border-2 border-indigo-500"
                            : "bg-purple-900/60 text-purple-300 border-2 border-purple-500"
                        }`}
                      >
                        {selectedGate === "CNOT" && (
                          <CircleDot size={16} md:size={18} />
                        )}
                        {selectedGate === "SWAP" && (
                          <ArrowRightLeft size={16} md:size={18} />
                        )}
                        {selectedGate !== "CNOT" &&
                          selectedGate !== "SWAP" &&
                          selectedGate}
                      </div>
                      <span className="font-medium text-xs md:text-sm text-purple-300">
                        {selectedGate === "CNOT" && "Control-Target"}
                        {selectedGate === "SWAP" && "Intercambio"}
                        {selectedGate !== "CNOT" &&
                          selectedGate !== "SWAP" &&
                          `Compuerta ${selectedGate}`}
                      </span>
                    </div>
                  ) : deleteMode ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-900/60 flex items-center justify-center border-2 border-red-500 text-red-300">
                        <Eraser size={16} md:size={18} />
                      </div>
                      <span className="font-medium text-xs md:text-sm text-red-300">
                        Modo Eliminar
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-400 flex items-center">
                      <MousePointerClick
                        size={18}
                        className="mr-1.5 text-purple-400"
                      />
                      <span className="text-xs md:text-sm">
                        Seleccione una compuerta o modo
                      </span>
                    </div>
                  )}
                </div>

                {selectedGate &&
                  (selectedGate === "CNOT" || selectedGate === "SWAP") &&
                  firstQubitForMulti && (
                    <div className="mt-1.5 p-1.5 md:p-2 bg-indigo-900/20 border border-indigo-800 rounded-lg text-xs md:text-sm">
                      <span className="text-indigo-300 font-medium">
                        Paso 1:
                      </span>{" "}
                      Qubit {firstQubitForMulti.qubit} seleccionado
                      <br />
                      <span className="text-indigo-300 font-medium">
                        Paso 2:
                      </span>{" "}
                      Haga clic en otro qubit
                    </div>
                  )}
              </div>

              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-purple-400">
                  Configuración
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium text-xs md:text-sm">
                      Qubits
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQubits(Math.max(1, qubits - 1))}
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                        title="Reducir qubits"
                      >
                        <Minus
                          size={14}
                          md:size={16}
                          className="text-purple-400"
                        />
                      </button>
                      <span className="w-6 md:w-7 text-center font-mono text-xs md:text-sm font-bold text-purple-400">
                        {qubits}
                      </span>
                      <button
                        onClick={() => setQubits(Math.min(8, qubits + 1))}
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                        title="Aumentar qubits"
                      >
                        <Plus
                          size={14}
                          md:size={16}
                          className="text-purple-400"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium text-xs md:text-sm">
                      Profundidad
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDepth(Math.max(2, depth - 1))}
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                        title="Reducir profundidad"
                      >
                        <Minus
                          size={14}
                          md:size={16}
                          className="text-blue-400"
                        />
                      </button>
                      <span className="w-6 md:w-7 text-center font-mono text-xs md:text-sm font-bold text-blue-400">
                        {depth}
                      </span>
                      <button
                        onClick={() => setDepth(Math.min(16, depth + 1))}
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                        title="Aumentar profundidad"
                      >
                        <Plus
                          size={14}
                          md:size={16}
                          className="text-blue-400"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  value={circuitName}
                  onChange={(e) => setCircuitName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre del circuito"
                />
              </div>
            </div>

            <div className="pt-1">
              <h3 className="text-sm font-semibold text-purple-400 mb-1.5 flex items-center">
                <Zap className="mr-1.5" size={16} md:size={18} />
                <span className="hidden xs:inline">Compuertas cuánticas</span>
                <span className="xs:hidden">Compuertas</span>
              </h3>
              <div className="space-y-2.5">
                <div>
                  <h4 className="text-xs text-purple-300/80 mb-1 flex items-center">
                    <CircleDot className="mr-1" size={12} md:size={14} />
                    <span className="hidden xs:inline">
                      Compuertas de un qubit
                    </span>
                    <span className="xs:hidden">1-qubit</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-1 md:gap-1.5">
                    {["H", "X", "Y", "Z", "S", "T"].map((gate) => (
                      <button
                        key={gate}
                        onClick={() => handleSelectGate(gate)}
                        className={`py-1.5 md:py-2 rounded-lg transition-all ${
                          selectedGate === gate
                            ? "bg-purple-900/70 border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                            : gate === "H"
                            ? "bg-purple-900/30 hover:bg-purple-900/40 text-purple-200"
                            : gate === "X"
                            ? "bg-red-900/30 hover:bg-red-900/40 text-red-200"
                            : gate === "Y"
                            ? "bg-yellow-900/30 hover:bg-yellow-900/40 text-yellow-200"
                            : gate === "Z"
                            ? "bg-blue-900/30 hover:bg-blue-900/40 text-blue-200"
                            : gate === "S"
                            ? "bg-cyan-900/30 hover:bg-cyan-900/40 text-cyan-200"
                            : "bg-teal-900/30 hover:bg-teal-900/40 text-teal-200"
                        }`}
                      >
                        <div className="font-bold text-[10px] xs:text-xs">
                          {gate}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-purple-300/80 mb-1 flex items-center">
                    <ArrowRightLeft className="mr-1" size={12} md:size={14} />
                    <span className="hidden xs:inline">
                      Compuertas multi-qubit
                    </span>
                    <span className="xs:hidden">Multi-qubit</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                    <button
                      onClick={() => handleSelectGate("CNOT")}
                      className={`p-2 md:p-2.5 rounded-lg transition-all ${
                        selectedGate === "CNOT"
                          ? "bg-indigo-900/70 border-2 border-indigo-500 shadow-lg shadow-indigo-500/20"
                          : "bg-indigo-900/30 hover:bg-indigo-900/40 text-indigo-200"
                      }`}
                    >
                      <div className="font-bold text-[10px] xs:text-xs flex justify-center">
                        CNOT
                      </div>
                    </button>
                    <button
                      onClick={() => handleSelectGate("SWAP")}
                      className={`p-2 md:p-2.5 rounded-lg transition-all ${
                        selectedGate === "SWAP"
                          ? "bg-green-900/70 border-2 border-green-500 shadow-lg shadow-green-500/20"
                          : "bg-green-900/30 hover:bg-green-900/40 text-green-200"
                      }`}
                    >
                      <div className="font-bold text-[10px] xs:text-xs flex justify-center">
                        SWAP
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-purple-300/80 mb-1 flex items-center">
                    <Ruler className="mr-1" size={12} md:size={14} />
                    Medición
                  </h4>
                  <button
                    onClick={() => handleSelectGate("MEASURE")}
                    className={`w-full p-2 md:p-2.5 rounded-lg transition-all ${
                      selectedGate === "MEASURE"
                        ? "bg-pink-900/70 border-2 border-pink-500 shadow-lg shadow-pink-500/20"
                        : "bg-pink-900/30 hover:bg-pink-900/40 text-pink-200"
                    }`}
                  >
                    <div className="font-bold text-[10px] xs:text-xs flex justify-center items-center">
                      <Ruler size={12} md:size={14} className="mr-0.5" />
                      MEDIR
                    </div>
                  </button>
                </div>

                {/* Nuevo botón para modo eliminar */}
                <div>
                  <h4 className="text-xs text-purple-300/80 mb-1 flex items-center">
                    <Eraser className="mr-1" size={12} md:size={14} />
                    Herramientas
                  </h4>
                  <button
                    onClick={toggleDeleteMode}
                    className={`w-full p-2 md:p-2.5 rounded-lg transition-all ${
                      deleteMode
                        ? "bg-red-900/70 border-2 border-red-500 shadow-lg shadow-red-500/20"
                        : "bg-red-900/30 hover:bg-red-900/40 text-red-200"
                    }`}
                  >
                    <div className="font-bold text-[10px] xs:text-xs flex justify-center items-center">
                      <Eraser size={12} md:size={14} className="mr-0.5" />
                      {deleteMode ? "DESACTIVAR" : "MODO ELIMINAR"}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading || gates.length === 0}
              className={`w-full flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition ${
                gates.length === 0
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : loading
                  ? "bg-blue-700/80 text-white animate-pulse"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/20"
              }`}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-lg md:text-xl"
                >
                  ⚛️
                </motion.div>
              ) : (
                <Play size={16} md:size={18} />
              )}
              {loading ? "Simulando..." : "Ejecutar Simulación"}
            </button>
          </div>
        </div>

        {/* Panel central - Diseño del circuito y resultados */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="h-10 md:h-12 bg-gray-900 border-b border-gray-800 px-2 md:px-4 flex items-center justify-between">
            <div className="md:hidden flex space-x-0.5">
              <button
                onClick={() => setActivePanel("design")}
                className={`px-2 md:px-3 py-1 rounded-t-lg font-medium text-[10px] xs:text-xs transition ${
                  activePanel === "design"
                    ? "bg-gray-800 text-purple-400 border border-gray-700"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Diseño
              </button>
              <button
                onClick={() => setActivePanel("simulation")}
                disabled={!simulation}
                className={`px-2 md:px-3 py-1 rounded-t-lg font-medium text-[10px] xs:text-xs transition ${
                  activePanel === "simulation"
                    ? "bg-gray-800 text-blue-400 border border-gray-700"
                    : simulation
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 cursor-not-allowed"
                }`}
              >
                Resultados
              </button>
            </div>
            <div className="hidden md:block">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActivePanel("design")}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-t-lg font-medium text-xs md:text-sm transition ${
                    activePanel === "design"
                      ? "bg-gray-800 text-purple-400 border border-gray-700"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Diseño del Circuito
                </button>
                <button
                  onClick={() => setActivePanel("simulation")}
                  disabled={!simulation}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-t-lg font-medium text-xs md:text-sm transition ${
                    activePanel === "simulation"
                      ? "bg-gray-800 text-blue-400 border border-gray-700"
                      : simulation
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Resultados de Simulación
                </button>
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-1">
              <button
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="p-0.5 rounded-md hover:bg-gray-700 transition"
                title="Reducir zoom"
              >
                <Minus size={14} className="text-gray-300" />
              </button>
              <span className="text-[10px] font-medium text-purple-300 min-w-[30px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="p-0.5 rounded-md hover:bg-gray-700 transition"
                title="Aumentar zoom"
              >
                <Plus size={14} className="text-gray-300" />
              </button>
            </div>
          </div>

          {activePanel === "design" ? (
            // Panel de diseño del circuito
            <div className="flex-1 overflow-auto p-2 md:p-3">
              <div className="w-full overflow-x-auto">
                <div className="inline-block border border-gray-800 rounded-xl bg-gray-900 shadow-lg min-w-full">
                  <div
                    className="grid rounded-xl overflow-hidden relative"
                    style={{
                      gridTemplateColumns: `70px repeat(${depth}, minmax(36px, ${cellWidth}px))`,
                      gridTemplateRows: `repeat(${qubits}, minmax(40px, 60px))`,
                    }}
                  >
                    {/* Etiquetas de qubits */}
                    {Array.from({ length: qubits }, (_, q) => (
                      <div
                        key={`label-${q}`}
                        className="flex items-center justify-end pr-2 md:pr-3 bg-gray-850/70 border-b border-r border-gray-800/70 sticky left-0 z-10"
                        style={{ gridRow: q + 1 }}
                      >
                        <div className="bg-purple-900/30 text-purple-300 font-mono text-[10px] xs:text-xs md:text-sm px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                          qubit {q}
                        </div>
                      </div>
                    ))}

                    {/* Celdas del circuito */}
                    {Array.from({ length: qubits }, (_, q) =>
                      Array.from({ length: depth }, (_, d) => {
                        const gate = gates.find(
                          (g) => g.qubit === q && g.depth === d
                        );
                        const isFirstForMulti =
                          firstQubitForMulti &&
                          firstQubitForMulti.qubit === q &&
                          firstQubitForMulti.depth === d;

                        const isHighlighted =
                          (deleteMode && gate) ||
                          (selectedGate && !gate) ||
                          (selectedGate === "CNOT" &&
                            firstQubitForMulti &&
                            !gate);

                        return (
                          <div
                            key={`${q}-${d}`}
                            className={`relative border-b border-r border-gray-800/50 bg-gray-900/30 cursor-pointer flex items-center justify-center transition-colors ${
                              gate
                                ? "bg-gray-850/80 border-purple-500/30 hover:bg-gray-800"
                                : "hover:bg-gray-800/40"
                            } ${
                              isHighlighted
                                ? deleteMode
                                  ? "bg-red-900/20 hover:bg-red-900/30 border-2 border-red-700/50"
                                  : "bg-purple-900/10 hover:bg-purple-900/20 border-2 border-purple-500/40"
                                : ""
                            } ${
                              isFirstForMulti
                                ? "bg-indigo-900/30 border-2 border-indigo-500"
                                : ""
                            }`}
                            style={{ gridColumn: d + 2, gridRow: q + 1 }}
                            onClick={() => handleClickCell(q, d)}
                          >
                            {renderGate(gate, q, d)}

                            {/* Indicador visual para multi-qubit */}
                            {selectedGate &&
                              (selectedGate === "CNOT" ||
                                selectedGate === "SWAP") &&
                              !gate &&
                              !isFirstForMulti && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                  {selectedGate === "CNOT" && (
                                    <>
                                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full ml-2"></div>
                                    </>
                                  )}
                                  {selectedGate === "SWAP" && (
                                    <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-[6px] text-black font-bold">
                                      <ArrowRightLeft size={8} />
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Indicador visual para modo eliminar */}
                            {deleteMode && gate && (
                              <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <RemoveIcon
                                  size={20}
                                  className="text-red-400/80"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Etiquetas de profundidad */}
                    <div
                      className="absolute bottom-0 left-0 right-0 flex mt-1.5 px-16 text-[8px] xs:text-[9px] sm:text-xs text-gray-500 font-mono overflow-x-auto"
                      style={{ width: "100%" }}
                    >
                      {Array.from({ length: depth }, (_, d) => (
                        <div
                          key={`depth-${d}`}
                          className="w-full text-center min-w-[36px]"
                          style={{ width: `${cellWidth}px` }}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Panel de resultados de simulación - versión optimizada para móvil
            <div className="flex-1 overflow-auto p-1.5 md:p-3">
              <div className="max-w-full mx-auto w-full">
                <h2 className="text-base md:text-xl lg:text-2xl font-bold text-gray-200 mb-3 md:mb-4 flex items-center">
                  <Zap
                    size={18}
                    md:size={24}
                    className="text-blue-400 mr-1.5 md:mr-2"
                  />
                  <span className="hidden xs:inline">
                    Resultados de la Simulación Cuántica
                  </span>
                  <span className="xs:hidden">Resultados Simulación</span>
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-4">
                  {/* Distribución de probabilidad - versión responsive */}
                  <div className="bg-gray-900/80 border border-gray-800 rounded-lg md:rounded-xl p-2.5 md:p-4">
                    <h3 className="text-xs md:text-lg font-bold text-gray-200 mb-2 md:mb-3 flex items-center">
                      <BarChartIcon
                        size={14}
                        md:size={20}
                        className="text-purple-400 mr-1 md:mr-2"
                      />
                      <span className="hidden xs:inline">
                        Distribución de Probabilidad
                      </span>
                      <span className="xs:hidden">Probabilidades</span>
                    </h3>
                    <div className="h-52 xs:h-56 sm:h-64 md:h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 5, right: 15, left: -10, bottom: 50 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis
                            dataKey="state"
                            stroke="#9ca3af"
                            tick={{ fontSize: 10, fill: "#9ca3af" }}
                            tickLine={{ stroke: "#6b7280" }}
                            axisLine={{ stroke: "#4b5563" }}
                            angle={-30}
                            textAnchor="end"
                            height={50}
                            interval={0}
                          />
                          <YAxis
                            stroke="#9ca3af"
                            tick={{ fontSize: 8, fill: "#9ca3af" }}
                            tickFormatter={(value) => `${value}%`}
                            tickLine={{ stroke: "#6b7280" }}
                            axisLine={{ stroke: "#4b5563" }}
                            width={28}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              border: "1px solid #374151",
                              borderRadius: "6px",
                              fontSize: "11px",
                            }}
                            labelStyle={{
                              color: "#bfdbfe",
                              fontWeight: "bold",
                            }}
                            formatter={(value) => [
                              `${value.toFixed(2)}%`,
                              "Probabilidad",
                            ]}
                            labelFormatter={(label) => `Estado: ${label}`}
                          />
                          <Bar
                            dataKey="probability"
                            fill="url(#probabilityGradient)"
                            radius={[3, 3, 0, 0]}
                          />
                          <defs>
                            <linearGradient
                              id="probabilityGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#8b5cf6"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#8b5cf6"
                                stopOpacity={0.2}
                              />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Estados por qubit */}
                  <div className="bg-gray-900/80 border border-gray-800 rounded-lg md:rounded-xl p-2.5 md:p-4">
                    <h3 className="text-xs md:text-lg font-bold text-gray-200 mb-2 md:mb-3 flex items-center">
                      <CircleDot
                        size={14}
                        md:size={20}
                        className="text-cyan-400 mr-1 md:mr-2"
                      />
                      <span className="hidden xs:inline">
                        Estados por Qubit
                      </span>
                      <span className="xs:hidden">Estados Qubit</span>
                    </h3>
                    <div className="space-y-2">
                      {simulation?.qubitStates.map((qState, i) => (
                        <div
                          key={i}
                          className="bg-gray-850/40 rounded-lg p-2 border border-gray-800/50"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <div className="text-xs xs:text-sm font-bold text-cyan-300 font-mono">
                                Qubit {i}
                              </div>
                              <div className="text-[10px] xs:text-xs text-purple-300 font-medium mt-0.5">
                                {qState.state}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-base xs:text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                {qState.prob1 > 95
                                  ? "1"
                                  : qState.prob0 > 95
                                  ? "0"
                                  : "±"}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 mt-1">
                            <div className="flex justify-between text-[10px] xs:text-xs">
                              <span className="text-gray-300">|0⟩</span>
                              <span className="font-mono font-bold text-green-400">
                                {qState.prob0.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                                style={{ width: `${qState.prob0}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between text-[10px] xs:text-xs mt-0.5">
                              <span className="text-gray-300">|1⟩</span>
                              <span className="font-mono font-bold text-blue-400">
                                {qState.prob1.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                style={{ width: `${qState.prob1}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Información adicional - versión responsive */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-lg md:rounded-xl p-2.5 md:p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    <div className="border-l-2 md:border-l-3 border-purple-500 pl-2 py-0.5">
                      <div className="text-[10px] xs:text-xs text-gray-400">
                        Profundidad
                      </div>
                      <div className="text-base xs:text-lg md:text-xl font-bold text-purple-400 mt-0.5">
                        {depth}
                      </div>
                    </div>
                    <div className="border-l-2 md:border-l-3 border-blue-500 pl-2 py-0.5">
                      <div className="text-[10px] xs:text-xs text-gray-400">
                        Compuertas
                      </div>
                      <div className="text-base xs:text-lg md:text-xl font-bold text-blue-400 mt-0.5">
                        {gates.length}
                      </div>
                    </div>
                    <div className="border-l-2 md:border-l-3 border-cyan-500 pl-2 py-0.5">
                      <div className="text-[10px] xs:text-xs text-gray-400">
                        Qubits
                      </div>
                      <div className="text-base xs:text-lg md:text-xl font-bold text-cyan-400 mt-0.5">
                        {qubits}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho - JSON y acciones */}
        <div
          className={`bg-gray-900 border-l border-gray-800 transition-all duration-300 overflow-y-auto ${
            rightPanelOpen ? "w-60 md:w-72 lg:w-80 shrink-0" : "w-0"
          } ${rightPanelOpen ? "block" : "hidden md:block"}`}
        >
          <div className="p-3 md:p-4 space-y-3 h-full">
            {errorMsg && (
              <div className="p-2 bg-red-900/15 border-l-2 md:border-l-3 border-red-600 text-red-300 text-[10px] xs:text-xs rounded-lg mb-2">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2.5">
              <h3 className="text-xs md:text-sm font-semibold text-purple-400 flex items-center">
                <CodeIcon size={14} md:size={18} className="mr-1.5" />
                <span className="hidden xs:inline">
                  Definición del Circuito
                </span>
              </h3>
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-2 max-h-36 overflow-auto text-[9px] xs:text-[10px] md:text-xs text-gray-300 font-mono">
                <pre>{circuitJSON}</pre>
              </div>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-1 md:gap-2 bg-gray-800 hover:bg-gray-700 py-1.5 md:py-2 rounded-lg transition text-[10px] xs:text-xs md:text-sm font-medium"
              >
                <Copy size={14} md:size={16} />
                {copied ? (
                  <span className="text-green-400 text-[10px] xs:text-xs">
                    ✔ Copiado
                  </span>
                ) : (
                  "Copiar JSON"
                )}
              </button>
            </div>

            <div className="pt-1">
              <h3 className="text-xs md:text-sm font-semibold text-purple-400 mb-1.5 flex items-center">
                <Zap size={14} md:size={18} className="mr-1.5" />
                <span className="hidden xs:inline">Acciones Rápidas</span>
                <span className="xs:hidden">Acciones</span>
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={clearAll}
                  className="w-full flex items-center justify-center gap-1 md:gap-2 bg-red-900/30 hover:bg-red-800/40 text-red-200 py-1.5 md:py-2 rounded-lg transition text-[10px] xs:text-xs md:text-sm font-medium"
                >
                  <Trash2 size={14} md:size={16} />
                  Limpiar Todo el Circuito
                </button>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-1 md:gap-2 bg-blue-900/30 hover:bg-blue-800/40 text-blue-200 py-1.5 md:py-2 rounded-lg transition text-[10px] xs:text-xs md:text-sm font-medium"
                >
                  <Download size={14} md:size={16} />
                  Exportar como Archivo JSON
                </button>
                <button
                  onClick={handleSimulate}
                  disabled={loading || gates.length === 0}
                  className={`w-full flex items-center justify-center gap-1 md:gap-2 py-1.5 md:py-2 rounded-lg font-medium transition ${
                    gates.length === 0
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-700 to-indigo-700 text-white hover:opacity-90"
                  }`}
                >
                  <Play size={14} md:size={16} />
                  {loading ? "Simulando..." : "Re-ejecutar Simulación"}
                </button>
              </div>
            </div>

            {/* Ayuda contextual para el modo eliminación */}
            <div className="mt-auto pt-3 border-t border-gray-800">
              <div className="bg-gray-800/30 rounded-lg p-2.5">
                <h4 className="text-xs font-semibold text-purple-300 mb-1 flex items-center">
                  <Eraser size={14} className="mr-1" />
                  Cómo eliminar compuertas
                </h4>
                <ul className="text-[10px] xs:text-xs space-y-1 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-1">•</span>
                    <span>
                      Activa el{" "}
                      <span className="text-red-400 font-medium">
                        "Modo Eliminar"
                      </span>{" "}
                      y haz clic en cualquier compuerta
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-1">•</span>
                    <span>
                      Haz clic en el{" "}
                      <span className="text-red-400">icono ✕</span> que aparece
                      en la esquina superior derecha de cada compuerta
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-1">•</span>
                    <span>
                      Usa{" "}
                      <span className="text-blue-400 font-medium">
                        Deshacer/Rehacer
                      </span>{" "}
                      si eliminas algo por error
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página - solo en móvil */}
      <footer className="md:hidden bg-gray-900 border-t border-gray-800 py-2 px-4 text-[10px] text-center text-gray-500">
        Quantum Lab • Simulación de circuitos cuánticos
      </footer>
    </div>
  );
}

// Componentes de iconos personalizados
const MousePointerClick = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
    <path d="M13 13l6 6"></path>
  </svg>
);

const BarChartIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

const CodeIcon = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

const X = ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
