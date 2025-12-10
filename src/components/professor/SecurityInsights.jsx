// src/components/SecurityInsights.jsx
import { useEffect, useState } from "react";

const SECURITY_DATA = [
  {
    scenario: "Búsqueda de clave simétrica (AES-128)",
    classical_complexity: "2¹²⁷ operaciones",
    quantum_complexity: "2⁶⁴ operaciones (Grover)",
    impact: "Alto",
    mitigation: "Duplicar longitud de clave (AES-256 → 2¹²⁸ cuántico)",
  },
  {
    scenario: "Búsqueda en base de datos no estructurada",
    classical_complexity: "O(N)",
    quantum_complexity: "O(√N)",
    impact: "Medio",
    mitigation: "Indexación, hashing criptográfico",
  },
  {
    scenario: "Ataque de preimagen a hash (SHA-256)",
    classical_complexity: "2²⁵⁶",
    quantum_complexity: "2¹²⁸ (Grover)",
    impact: "Alto",
    mitigation: "Usar SHA3-384 o SHA3-512",
  },
  {
    scenario: "Fuerza bruta en contraseñas débiles",
    classical_complexity: "Horas/días",
    quantum_complexity: "Minutos/segundos",
    impact: "Alto",
    mitigation: "Contraseñas fuertes + MFA + salting",
  },
];

export default function SecurityInsights({ nQubits }) {
  const [currentScenario, setCurrentScenario] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % SECURITY_DATA.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const scenario = SECURITY_DATA[currentScenario];
  const impactColor = { Bajo: "#28a745", Medio: "#ffc107", Alto: "#dc3545" }[
    scenario.impact
  ];

  return (
    <div
      style={{
        marginTop: "2rem",
        background: "#fff3cd",
        border: "1px solid #ffeaa7",
        borderRadius: "8px",
        padding: "1.5rem",
      }}
    >
      <h3>🔐 Impacto en ciberseguridad</h3>

      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "6px",
          borderLeft: `4px solid ${impactColor}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              background: impactColor,
              color: "white",
              padding: "0.25rem 0.75rem",
              borderRadius: "20px",
              fontSize: "0.85rem",
            }}
          >
            Impacto: {scenario.impact}
          </span>
          <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>
            Ejemplo con {2 ** nQubits} elementos
          </span>
        </div>

        <h4 style={{ margin: "0.5rem 0" }}>{scenario.scenario}</h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <div>
            <strong>Clásico:</strong> {scenario.classical_complexity}
          </div>
          <div>
            <strong>Cuántico:</strong> {scenario.quantum_complexity}
          </div>
        </div>

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#f8f9fa",
            borderRadius: "4px",
          }}
        >
          <strong>🛡️ Mitigación:</strong> {scenario.mitigation}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
      >
        {SECURITY_DATA.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentScenario(i)}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: i === currentScenario ? impactColor : "#ccc",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-label={`Escenario ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
