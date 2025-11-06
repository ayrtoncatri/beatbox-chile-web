'use client';

// (1) Importamos los tipos de la Fase 5
import { SerializedHistoryResult } from '@/app/actions/public-data';
import { RoundPhase } from '@prisma/client';

// (2) Importamos Chart.js y el componente de línea
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  Filler, // Para el fondo (opcional)
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';
import { groupBy, meanBy } from 'lodash';

// (3) Registramos los componentes de Chart.js que usaremos
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CriteriaEvolutionChartProps {
  historyData: SerializedHistoryResult[];
}

// --- (4) Lógica de Negocio ---
// Define los criterios que quieres rastrear en el gráfico
// IMPORTANTE: Estos strings deben coincidir EXACTAMENTE con los 'name' en tu tabla 'Criterio'
const CRITERIA_TO_TRACK = ['Originalidad', 'Técnica', 'Musicalidad']; 

// Define los colores para cada línea (estilo profesional)
const CRITERIA_COLORS: { [key: string]: { border: string; bg: string } } = {
  'Originalidad': {
    border: 'rgba(59, 130, 246, 1)', // blue-500
    bg: 'rgba(59, 130, 246, 0.2)',
  },
  'Técnica': {
    border: 'rgba(239, 68, 68, 1)', // red-500
    bg: 'rgba(239, 68, 68, 0.2)',
  },
  'Musicalidad': {
    border: 'rgba(22, 163, 74, 1)', // green-600
    bg: 'rgba(22, 163, 74, 0.2)',
  },
};

export function CriteriaEvolutionChart({ historyData }: CriteriaEvolutionChartProps) {
  const chartData = useMemo((): ChartData<'line'> | null => {
    if (!historyData || historyData.length === 0) {
      return null;
    }

    const groupedByParticipation = groupBy(historyData, 
      (score) => `${score.evento.nombre} (${formatPhase(score.phase)})`
    );

    const participations = Object.entries(groupedByParticipation)
      .map(([key, scores]) => ({
        key,
        date: new Date(scores[0].evento.fecha),
        scores 
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime()); 
      
    const labels = participations.map(p => p.key);

    const datasets = CRITERIA_TO_TRACK.map(criterionName => {
      
      const dataPoints = participations.map(participation => {

        
        // Obtenemos TODOS los 'details' de todos los jueces para este criterio
        const criteriaDetails = participation.scores
          .flatMap(s => s.details) // [detail1, detail2, detail3, ...]
          .filter(d => d.criterio.name === criterionName); // Filtramos por ej. "Originalidad"

        if (criteriaDetails.length === 0) {
          return null; // No se evaluó este criterio en este evento (la línea tendrá un hueco)
        }

        // Calculamos el promedio de este criterio en esta participación
        const avgValue = meanBy(criteriaDetails, 'value');
        return parseFloat(avgValue.toFixed(2));
      });

      const colors = CRITERIA_COLORS[criterionName] || { border: 'rgba(255, 255, 255, 1)', bg: 'rgba(255, 255, 255, 0.2)' };

      return {
        label: criterionName,
        data: dataPoints,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        fill: true, // Rellena el área bajo la línea
        tension: 0.3, // Curva suave
        pointBackgroundColor: colors.border,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    return { labels, datasets };

  }, [historyData]);

  // --- (6) Opciones de Estilo (Dark Mode) ---
  const options = {
    responsive: true,
    maintainAspectRatio: false, // CLAVE para que llene el div 'h-96'
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { 
          color: '#D1D5DB', // text-gray-300
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 40, // Asumimos que 40 es el máximo (de Originalidad)
        ticks: { color: '#9CA3AF' }, // text-gray-400
        grid: { color: '#374151' } // text-gray-700
      },
      x: {
        ticks: { color: '#9CA3AF' }, // text-gray-400
        grid: { display: false } // Ocultar grid vertical
      }
    }
  };

  if (!chartData || chartData.datasets.every(ds => ds.data.every(d => d === null))) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        No hay suficientes datos de criterios para mostrar la evolución.
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}

function formatPhase(phase: RoundPhase) {
  switch (phase) {
    case 'WILDCARD': return 'Wildcard';
    case 'PRELIMINAR': return 'Showcase';
    case 'OCTAVOS': return 'Octavos';
    case 'CUARTOS': return 'Cuartos';
    case 'SEMIFINAL': return 'Semifinal';
    case 'TERCER_LUGAR': return '3er Lugar';
    case 'FINAL': return 'Final';
    default: return phase;
  }
}