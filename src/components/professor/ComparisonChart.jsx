// src/components/ComparisonChart.jsx
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export default function ComparisonChart({ nQubits, groverAttempts }) {
  const N = 2 ** nQubits;
  const avgClassical = N / 2;

  const data = {
    labels: ["Clásico (fuerza bruta)", "Cuántico (Grover)"],
    datasets: [
      {
        label: "Intentos esperados",
        data: [avgClassical, groverAttempts],
        backgroundColor: ["#dc3545", "#28a745"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Búsqueda en ${N} elementos`,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            return `${ctx.label}: ${parseFloat(value).toFixed(1)} intentos`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Número de intentos" },
      },
    },
  };

  return (
    <div style={{ height: "250px" }}>
      <Bar data={data} options={options} />
      <div
        style={{
          textAlign: "center",
          marginTop: "0.5rem",
          fontSize: "0.9rem",
          color: "#666",
        }}
      >
        Aceleración: {(avgClassical / groverAttempts || 0).toFixed(1)}x
      </div>
    </div>
  );
}
