// frontend/src/components/GroverForm.jsx
import { useState } from "react";
import { runGrover } from "../../services/quantumApi";

export default function GroverForm({ onResult, onError }) {
  const [nQubits, setNQubits] = useState(3);
  const [markedState, setMarkedState] = useState("101");
  const [iterations, setIterations] = useState("");
  const [loading, setLoading] = useState(false);

  // Calcular iteraciones óptimas dinámicamente
  const optimalIterations = Math.round((Math.PI / 4) * Math.sqrt(2 ** nQubits));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validación crítica: longitud debe coincidir
    if (markedState.length !== nQubits) {
      onError(
        `Estado objetivo debe tener exactamente ${nQubits} bits. Tiene ${markedState.length}.`
      );
      return;
    }

    if (!/^[01]+$/.test(markedState)) {
      onError(" Estado objetivo debe contener solo '0' y '1'.");
      return;
    }

    setLoading(true);
    onError("");

    try {
      const params = {
        n_qubits: nQubits,
        marked_state: markedState,
        iterations: iterations === "" ? null : Number(iterations),
        shots: 1024,
      };
      const result = await runGrover(params);
      onResult(result);
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Error desconocido";
      onError(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <h2>🔍 Ejecutar algoritmo de Grover</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Qubits (2–8)
          </label>
          <select
            value={nQubits}
            onChange={(e) => {
              const n = Number(e.target.value);
              setNQubits(n);
              setMarkedState("1".repeat(n));
            }}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ced4da",
              borderRadius: "4px",
            }}
          >
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                n = {n} (espacio: {2 ** n})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Estado objetivo ({nQubits} bits)
          </label>
          <input
            type="text"
            value={markedState}
            onChange={(e) => setMarkedState(e.target.value.slice(0, nQubits))}
            maxLength={nQubits}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ced4da",
              borderRadius: "4px",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Iteraciones (óptimo: {optimalIterations})
          </label>
          <input
            type="number"
            min="0"
            value={iterations}
            onChange={(e) => setIterations(e.target.value)}
            placeholder="Dejar vacío para óptimo"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ced4da",
              borderRadius: "4px",
            }}
          />
          <div
            style={{
              fontSize: "0.85rem",
              color: "#6c757d",
              marginTop: "0.25rem",
            }}
          >
            Dejar vacío → usar {optimalIterations}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "0.75rem 2rem",
          fontSize: "1.1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? "Ejecutando..." : "Ejecutar Grover"}
      </button>
    </form>
  );
}
