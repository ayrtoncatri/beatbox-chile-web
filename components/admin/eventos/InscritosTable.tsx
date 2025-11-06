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
  let styles = 'bg-gray-100 text-gray-800'; // Estilo por defecto

  switch (source) {
    case 'WILDCARD':
      text = 'Wildcard';
      Icon = TicketIcon;
      styles = 'bg-green-100 text-green-800'; // Verde para wildcards
      break;
    case 'LIGA_ADMIN':
      text = 'Liga (Admin)';
      Icon = ClipboardDocumentListIcon;
      styles = 'bg-blue-100 text-blue-800'; // Azul para Ligas
      break;
    case 'CN_HISTORICO_TOP3':
      text = 'Top 3 CN';
      Icon = TrophyIcon;
      styles = 'bg-purple-100 text-purple-800'; // Púrpura para clasificados
      break;
    case 'LIGA_PRESENCIAL_TOP3':
      text = 'Top 3 Liga P.';
      Icon = TrophyIcon;
      styles = 'bg-purple-100 text-purple-800';
      break;
    case 'LIGA_ONLINE_TOP3':
      text = 'Top 3 Liga O.';
      Icon = TrophyIcon;
      styles = 'bg-purple-100 text-purple-800';
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      
      {/* --- (3) Título de la Sección --- */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold leading-6 text-gray-900">
          Participantes Inscritos ({inscritos.length})
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Lista de todos los participantes registrados en este evento.
        </p>
      </div>

      {/* --- (4) Tabla --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Participante (Alias)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Categoría
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fuente de Inscripción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            
            {/* --- (5) Estado Vacío --- */}
            {inscritos.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-sm text-gray-500"
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
                <tr key={inscrito.id} className="hover:bg-gray-50">
                  {/* Columna: Participante */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                          {initials}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {inscrito.nombreArtistico || fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inscrito.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Columna: Categoría */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {inscrito.categoria.name}
                    </span>
                  </td>
                  
                  {/* Columna: Fuente (con el badge helper) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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