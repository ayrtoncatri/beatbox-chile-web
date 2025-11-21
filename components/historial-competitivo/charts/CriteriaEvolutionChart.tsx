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

// --- (4) Lógica de Negocio y Colores (Adaptado a Rojo, Azul y Cyan) ---
// Define los criterios que quieres rastrear en el gráfico
const CRITERIA_TO_TRACK = ['Originalidad', 'Técnica', 'Musicalidad']; 

// Define los colores para cada línea (COLORES CARACTERÍSTICOS)
const CRITERIA_COLORS: { [key: string]: { border: string; bg: string } } = {
  'Originalidad': {
    border: 'rgba(45, 212, 191, 1)', // Cyan-400 (Innovación/Tech)
    bg: 'rgba(45, 212, 191, 0.15)',
  },
  'Técnica': {
    border: 'rgba(239, 68, 68, 1)', // Red-500 (Poder/Rojo Chile)
    bg: 'rgba(239, 68, 68, 0.15)',
  },
  'Musicalidad': {
    border: 'rgba(59, 130, 246, 1)', // Blue-500 (Estructura/Azul Chile)
    bg: 'rgba(59, 130, 246, 0.15)',
  },
};

export function CriteriaEvolutionChart({ historyData }: CriteriaEvolutionChartProps) {
  const chartData = useMemo((): ChartData<'line'> | null => {
    if (!historyData || historyData.length === 0) {
      return null;
    }

    const groupedByParticipation = groupBy(historyData, 
      (score) => `${score.evento.nombre.toUpperCase()} (${formatPhase(score.phase)})`
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
        pointRadius: 5, // Puntos más grandes para visibilidad
        pointHoverRadius: 8,
      };
    });

    return { labels, datasets };

  }, [historyData]);

  // --- (6) Opciones de Estilo (Dark Mode & Tech) ---
  const options = {
    responsive: true,
    maintainAspectRatio: false, // CLAVE para que llene el div 'h-96'
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { 
          color: '#FFFFFF', // Blanco puro
          font: { size: 13, weight: 'bold' as const } // Texto de leyenda agresivo
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(10, 10, 25, 0.9)', // Darker blue tooltip
        titleFont: { size: 15, weight: 'bold' as const }, 
        bodyFont: { size: 13, family: 'monospace' }, // Fuente mono para datos
        padding: 12,
        cornerRadius: 4,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 40, // Asumimos que 40 es el máximo
        ticks: { 
            color: '#93C5FD', // light blue (blue-300) 
            font: { family: 'monospace' } // Datos del eje en fuente mono
        }, 
        grid: { color: 'rgba(55, 65, 81, 0.3)' } // Grid sutil
      },
      x: {
        ticks: { 
            color: '#93C5FD', // light blue (blue-300)
            font: { size: 10, weight: 'bold' as const } 
        },
        grid: { display: false } // Ocultar grid vertical
      }
    }
  };

  if (!chartData || chartData.datasets.every(ds => ds.data.every(d => d === null))) {
    return (
      <div className="h-full flex items-center justify-center text-white/50 font-black italic">
        No hay suficientes datos de criterios para mostrar la evolución del atleta.
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