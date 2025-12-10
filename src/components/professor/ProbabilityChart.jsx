// src/components/ProbabilityChart.jsx
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ProbabilityChart({ counts, markedState, shots }) {
  const labels = Object.keys(counts).sort();
  const data = {
    labels,
    datasets: [
      {
        label: "Frecuencia",
        data: labels.map((state) => counts[state]),
        backgroundColor: labels.map((state) =>
          state === markedState ? "#0088ff" : "#6c757d"
        ),
        borderColor: labels.map((state) =>
          state === markedState ? "#0055aa" : "#495057"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Resultados de ${shots} ejecuciones`,
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Frecuencia" },
      },
      x: {
        title: { display: true, text: "Estado medido" },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Bar data={data} options={options} />
    </div>
  );
}
