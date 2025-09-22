"use client";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

export function UsuariosPorEstadoChart({ data }: { data: { activos: number; inactivos: number } }) {
  return (
    <Doughnut
      data={{
        labels: ["Activos", "Inactivos"],
        datasets: [
          {
            data: [data.activos, data.inactivos],
            backgroundColor: ["#6366f1", "#e5e7eb"],
            borderWidth: 1,
          },
        ],
      }}
      options={{
        plugins: {
          legend: { display: true, position: "bottom" },
        },
        cutout: "70%",
      }}
    />
  );
}

export function WildcardsPorEstadoChart({ data }: { data: { aprobados: number; rechazados: number; pendientes: number } }) {
  return (
    <Bar
      data={{
        labels: ["Aprobados", "Rechazados", "Pendientes"],
        datasets: [
          {
            label: "Cantidad",
            data: [data.aprobados, data.rechazados, data.pendientes],
            backgroundColor: ["#22c55e", "#ef4444", "#facc15"],
            borderRadius: 8,
          },
        ],
      }}
      options={{
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      }}
    />
  );
}

export function ComprasPorMesChart({ data }: { data: { labels: string[]; values: number[] } }) {
  return (
    <Bar
      data={{
        labels: data.labels,
        datasets: [
          {
            label: "Ingresos CLP",
            data: data.values,
            backgroundColor: "#f97316",
            borderRadius: 8,
          },
        ],
      }}
      options={{
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      }}
    />
  );
}