// frontend/src/components/ResultsPanel.jsx
import ProbabilityChart from "./ProbabilityChart";
import ComparisonChart from "./ComparisonChart";

export default function ResultsPanel({ result }) {
  // ✅ Protección: solo continuar si result tiene estructura mínima
  if (!result || !result.input || !result.result || !result.info) {
    return (
      <div style={{ padding: "1rem", color: "#666" }}>
        Cargando resultados...
      </div>
    );
  }

  // ✅ Desestructuración segura con valores por defecto
  const {
    input: {
      n_qubits = 0,
      marked_state = "",
      iterations_used = 0,
      shots = 0,
    } = {},
    result: {
      most_frequent_measurement = "",
      success_probability = 0,
      counts = {},
      is_success = false,
    } = {},
    info: {
      optimal_iterations = 0,
      circuit_depth = 0,
      space_size = 0,
      classical_equivalent = 0,
    } = {},
  } = result;

  return (
    <div
      style={{
        marginTop: "2rem",
        background: "#f8f9fa",
        borderRadius: "8px",
        padding: "1.5rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        color: "#000", // ✅ Texto principal del panel en negro
      }}
    >
      <h3 style={{ color: "#000", margin: "0 0 1.5rem 0" }}>
        Resultados del algoritmo de Grover
      </h3>

      {/* Métricas clave */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <MetricCard
          title="Éxito"
          value={is_success ? "Sí" : "No"}
          color={is_success ? "#28a745" : "#dc3545"}
        />
        <MetricCard
          title="Probabilidad"
          value={`${(success_probability * 100).toFixed(1)}%`}
          subtitle="de encontrar el estado correcto"
        />
        <MetricCard
          title="Iteraciones"
          value={`${iterations_used} / ${optimal_iterations}`}
          subtitle="usadas / óptimas"
        />
        <MetricCard
          title="Ejecuciones"
          value={`${shots}`}
          subtitle="simulaciones cuánticas"
        />
        <MetricCard
          title="Profundidad"
          value={`${circuit_depth}`}
          subtitle="del circuito"
        />
      </div>

      {/* Gráficos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h4 style={{ color: "#000", margin: "0 0 0.5rem 0" }}>
            Distribución de resultados
          </h4>
          <ProbabilityChart
            counts={counts}
            markedState={marked_state}
            shots={shots}
          />
        </div>
        <div>
          <h4 style={{ color: "#000", margin: "0 0 0.5rem 0" }}>
            Comparativa: Clásico vs Cuántico
          </h4>
          <ComparisonChart
            nQubits={n_qubits}
            groverAttempts={iterations_used}
          />
          <p
            style={{
              fontSize: "0.9rem",
              color: "#666", // ✅ Información secundaria en gris (mejor jerarquía)
              marginTop: "0.5rem",
            }}
          >
            Espacio: {space_size} elementos | Clásico: ~{classical_equivalent}{" "}
            intentos
          </p>
        </div>
      </div>

      {/* Tabla detallada */}
      <div>
        <h4 style={{ color: "#000", margin: "1rem 0 0.5rem 0" }}>
          Detalle de mediciones
        </h4>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.5rem",
            color: "#000", // ✅ Texto de la tabla en negro
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#e9ecef" }}>
              <th
                style={{
                  padding: "0.5rem",
                  textAlign: "left",
                  borderBottom: "2px solid #dee2e6",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                Estado
              </th>
              <th
                style={{
                  padding: "0.5rem",
                  textAlign: "right",
                  borderBottom: "2px solid #dee2e6",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                Frecuencia
              </th>
              <th
                style={{
                  padding: "0.5rem",
                  textAlign: "right",
                  borderBottom: "2px solid #dee2e6",
                  color: "#000",
                  fontWeight: "bold",
                }}
              >
                Probabilidad
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([state, freq]) => (
                <tr
                  key={state}
                  style={{
                    backgroundColor:
                      state === marked_state ? "#d1ecf1" : "transparent",
                    fontWeight:
                      state === most_frequent_measurement ? "bold" : "normal",
                  }}
                >
                  <td
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #dee2e6",
                      color: "#000",
                    }}
                  >
                    {state}
                    {state === marked_state && (
                      <span style={{ color: "#0056b3", fontWeight: "bold" }}>
                        {" ← objetivo"}
                      </span>
                    )}
                    {state === most_frequent_measurement &&
                      state !== marked_state && (
                        <span style={{ color: "#856404", fontWeight: "bold" }}>
                          {" ← más frecuente"}
                        </span>
                      )}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      textAlign: "right",
                      border: "1px solid #dee2e6",
                      color: "#000",
                    }}
                  >
                    {freq}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      textAlign: "right",
                      border: "1px solid #dee2e6",
                      color: "#000",
                    }}
                  >
                    {((freq / shots) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color = "#007bff" }) {
  return (
    <div
      style={{
        background: "white",
        padding: "1rem",
        borderRadius: "6px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>{title}</div>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: color, // ✅ Valor destacado con color semántico (no negro)
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: "0.75rem",
            color: "#6c757d", // ✅ Subtítulo informativo en gris (profesional)
            marginTop: "0.25rem",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
