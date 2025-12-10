// src/App.jsx
import { useState } from "react";
import GroverForm from "../../components/professor/GroverForm";
import ResultsPanel from "../../components/professor/ResultsPanel";
import SecurityInsights from "../../components/professor/SecurityInsights";

function Algoritmos() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "1rem",
      }}
    >
      <header
        style={{
          textAlign: "center",
          padding: "2rem 1rem",
          background: "#004a99",
          color: "white",
          borderRadius: "8px",
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <h1>🔐 Servicio Cuántico: Algoritmo de Grover</h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
          Demostración local de aceleración cuántica para ciberseguridad
        </p>
        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            display: "inline-block",
            padding: "0.25rem 1rem",
            borderRadius: "20px",
            fontSize: "0.9rem",
            marginTop: "0.5rem",
          }}
        >
          ✅ Sin cuenta externa • 100% local • Qiskit 1.3+
        </div>
      </header>

      <GroverForm onResult={setResult} onError={setError} />

      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <>
          <ResultsPanel result={result} />
          <SecurityInsights nQubits={result.input.n_qubits} />
        </>
      )}

      <footer
        style={{
          marginTop: "3rem",
          textAlign: "center",
          color: "#6c757d",
          fontSize: "0.9rem",
          borderTop: "1px solid #eee",
          paddingTop: "1rem",
        }}
      >
        <p>Microservicio cuántico local • {new Date().getFullYear()}</p>
        <p>Basado en Qiskit • Algoritmo de Grover para búsqueda acelerada</p>
      </footer>
    </div>
  );
}

export default Algoritmos;
