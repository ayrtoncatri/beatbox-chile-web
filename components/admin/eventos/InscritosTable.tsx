// components/admin/eventos/InscritosTable.tsx

// (No necesitamos 'use client' aquí, es un componente de UI simple)
import { InscritosResult } from '@/app/admin/eventos/actions';
import { InscripcionSource } from '@prisma/client';

// (Importamos los íconos que usaremos para los badges)
import {
  TicketIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

// --- (1) Componente Helper para los Badges de "Fuente" ---
// Esto crea los badges de colores para mostrar CÓMO se inscribió
function SourceBadge({ source }: { source: InscripcionSource }) {
  let text = 'Admin';
  let Icon = UserIcon;
  let styles = 'bg-blue-900/50 text-blue-200 border border-blue-700/30'; // Estilo por defecto

  switch (source) {
    case 'WILDCARD':
      text = 'Wildcard';
      Icon = TicketIcon;
      styles = 'bg-green-900/50 text-green-300 border border-green-700/30'; // Verde para wildcards
      break;
    case 'LIGA_ADMIN':
      text = 'Liga (Admin)';
      Icon = ClipboardDocumentListIcon;
      styles = 'bg-blue-900/50 text-blue-300 border border-blue-700/30'; // Azul para Ligas
      break;
    case 'CN_HISTORICO_TOP3':
      text = 'Top 3 CN';
      Icon = TrophyIcon;
      styles = 'bg-purple-900/50 text-purple-300 border border-purple-700/30'; // Púrpura para clasificados
      break;
    case 'LIGA_PRESENCIAL_TOP3':
      text = 'Top 3 Liga P.';
      Icon = TrophyIcon;
      styles = 'bg-purple-900/50 text-purple-300 border border-purple-700/30';
      break;
    case 'LIGA_ONLINE_TOP3':
      text = 'Top 3 Liga O.';
      Icon = TrophyIcon;
      styles = 'bg-purple-900/50 text-purple-300 border border-purple-700/30';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}
    >
      <Icon className="w-4 h-4" />
      {text}
    </span>
  );
}

// --- (2) Componente Principal de la Tabla ---
interface InscritosTableProps {
  inscritos: InscritosResult[];
}

export function InscritosTable({ inscritos }: InscritosTableProps) {
  return (
    // (Contenedor estilizado para el panel de admin)
    <div className="bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-950/80 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-700/30 overflow-hidden">
      
      {/* --- (3) Título de la Sección --- */}
      <div className="px-6 py-4 border-b border-blue-700/30">
        <h3 className="text-lg font-semibold leading-6 text-white">
          Participantes Inscritos ({inscritos.length})
        </h3>
        <p className="mt-1 text-sm text-blue-200">
          Lista de todos los participantes registrados en este evento.
        </p>
      </div>

      {/* --- (4) Tabla --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-700/30">
          <thead className="bg-blue-900/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                Participante (Alias)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                Categoría
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider"
              >
                Fuente de Inscripción
              </th>
            </tr>
          </thead>
          <tbody className="bg-blue-900/30 divide-y divide-blue-700/30">
            
            {/* --- (5) Estado Vacío --- */}
            {inscritos.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-sm text-blue-300/70"
                >
                  Aún no hay participantes inscritos en este evento.
                </td>
              </tr>
            )}

            {/* --- (6) Mapeo de Inscritos --- */}
            {inscritos.map((inscrito) => {
              const profile = inscrito.user.profile;
              const fullName =
                [profile?.nombres, profile?.apellidoPaterno]
                  .filter(Boolean)
                  .join(' ') || inscrito.user.email;

              // Obtenemos las iniciales para el avatar
              const initials = (profile?.nombres?.[0] || 'U').toUpperCase();

              return (
                <tr key={inscrito.id} className="hover:bg-blue-800/30">
                  {/* Columna: Participante */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/50 font-semibold">
                          {initials}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-100">
                          {inscrito.nombreArtistico || fullName}
                        </div>
                        <div className="text-sm text-blue-300/70">
                          {inscrito.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Columna: Categoría */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-blue-900/50 text-blue-200 border border-blue-700/30">
                      {inscrito.categoria.name}
                    </span>
                  </td>
                  
                  {/* Columna: Fuente (con el badge helper) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                    <SourceBadge source={inscrito.source} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}