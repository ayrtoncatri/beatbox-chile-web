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
            backgroundColor: ["#3b82f6", "#64748b"],
            borderWidth: 2,
            borderColor: "#1e293b",
          },
        ],
      }}
      options={{
        plugins: {
          legend: { 
            display: true, 
            position: "bottom",
            labels: {
              color: "#cbd5e1",
              font: {
                size: 12
              }
            }
          },
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
            backgroundColor: ["#3b82f6", "#ef4444", "#fbbf24"],
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#1e293b",
          },
        ],
      }}
      options={{
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { 
            beginAtZero: true, 
            ticks: { 
              stepSize: 1,
              color: "#cbd5e1"
            },
            grid: {
              color: "#334155"
            }
          },
          x: {
            ticks: {
              color: "#cbd5e1"
            },
            grid: {
              color: "#334155"
            }
          }
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
            backgroundColor: "#3b82f6",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#1e293b",
          },
        ],
      }}
      options={{
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { 
            beginAtZero: true,
            ticks: {
              color: "#cbd5e1"
            },
            grid: {
              color: "#334155"
            }
          },
          x: {
            ticks: {
              color: "#cbd5e1"
            },
            grid: {
              color: "#334155"
            }
          }
        },
      }}
    />
  );
}