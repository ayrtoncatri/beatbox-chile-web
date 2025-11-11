'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type {
  JudgeAssignment,
  Criterio,
  Wildcard,
  Score,
  ScoreDetail,
  User,
  UserProfile,
  Evento,
  Categoria,
  Inscripcion,
  Battle,
} from '@prisma/client'
import { RoundPhase } from '@prisma/client'

import { JudgeScoreForm } from '@/components/judge/dashboard/JudgeScoreForm'
import { BattleScoreForm } from '@/components/judge/dashboard/BattleScoreForm'

type FullJudgeAssignment = JudgeAssignment & { evento: Evento; categoria: Categoria }
type FullScore = Score & { details: ScoreDetail[] }
type FullParticipant = Inscripcion & {
  user: (User & { profile: UserProfile | null });
  wildcard: { youtubeUrl: string } | null;
}
type FullBattle = Battle & {
  participantA: User & { profile: UserProfile | null, inscripciones: { nombreArtistico: string | null }[] };
  participantB: (User & { profile: UserProfile | null, inscripciones: { nombreArtistico: string | null }[] }) | null;
}
type FullApprovedWildcard = Wildcard & {
  user: (User & { profile: UserProfile | null });
}

interface JudgePanelProps {
  assignments: FullJudgeAssignment[]
  allCriterios: Criterio[]
  participants: FullParticipant[]
  battles: FullBattle[]
  initialScores: FullScore[]
  approvedWildcards: FullApprovedWildcard[]
}

const springTransition = { type: 'spring', stiffness: 300, damping: 30 };

export function JudgePanel({
  assignments,
  allCriterios,
  participants,
  battles,
  initialScores,
  approvedWildcards
}: JudgePanelProps) {

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id || '')
  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId)

  const isBattlePhase =
    selectedAssignment?.phase !== RoundPhase.WILDCARD &&
    selectedAssignment?.phase !== RoundPhase.PRELIMINAR;

  const relevantCriterios = selectedAssignment
    ? allCriterios.filter(c => c.categoriaId === selectedAssignment.categoriaId)
    : []

  // ---------- helpers UI ----------
  const PanelTag = ({ text }: { text: string }) => (
    <div className="relative inline-block -skew-x-6">
      <span className="absolute -inset-1 rounded bg-gradient-to-r from-fuchsia-600/25 via-purple-600/25 to-sky-500/25" />
      <span className="relative block px-3 py-1 text-[11px] font-black tracking-wide uppercase text-fuchsia-200">
        {text}
      </span>
    </div>
  );

  const PhaseBadge = ({ phase }: { phase: string }) => (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
      {phase}
    </span>
  );

  // ---------- SHOWCASE (WILDCARD / PRELIMINAR) ----------
  const renderShowcaseForms = () => {
    if (!selectedAssignment) return null;

    if (selectedAssignment.phase === RoundPhase.WILDCARD) {
      const relevantWildcards = approvedWildcards.filter(w =>
        w.eventoId === selectedAssignment.eventoId &&
        w.categoriaId === selectedAssignment.categoriaId
      );

      if (relevantWildcards.length === 0) {
        return <p className="text-blue-100/70 italic px-2">No hay wildcards aprobados para evaluar en esta categoría.</p>
      }

      return (
        <div className="flex flex-col gap-20">
            {relevantWildcards.map(wildcard => {
            const existingScore = initialScores.find(s =>
                s.participantId === wildcard.userId &&
                s.eventoId === selectedAssignment.eventoId &&
                s.categoriaId === selectedAssignment.categoriaId &&
                s.phase === selectedAssignment.phase
            );

            const wildcardProp = {
                id: wildcard.id,
                userId: wildcard.userId,
                nombreArtistico: wildcard.nombreArtistico,
                youtubeUrl: wildcard.youtubeUrl,
                user: wildcard.user,
            };

            return (
                <div key={wildcard.id} className="pb-16 border-b border-white/10 last:border-none">
                <JudgeScoreForm
                    wildcard={wildcardProp as any}
                    assignment={selectedAssignment}
                    criterios={relevantCriterios}
                    existingScore={existingScore || null}
                />
                </div>
            );
            })}
        </div>
      );
    }

    // PRELIMINAR
    const relevantParticipants = participants.filter(p =>
      p.eventoId === selectedAssignment.eventoId &&
      p.categoriaId === selectedAssignment.categoriaId
    );

    if (relevantParticipants.length === 0) {
      return <p className="text-blue-100/70 italic px-2">No hay participantes inscritos para evaluar en esta categoría/fase.</p>
    }

    return (
      <div className="flex flex-col gap-20">
        {relevantParticipants.map(participant => {
          const existingScore = initialScores.find(s =>
            s.participantId === participant.userId &&
            s.eventoId === selectedAssignment.eventoId &&
            s.categoriaId === selectedAssignment.categoriaId &&
            s.phase === selectedAssignment.phase
          );

          const wildcardProp = {
            id: participant.id,
            userId: participant.userId,
            nombreArtistico: participant.nombreArtistico,
            youtubeUrl: participant.wildcard?.youtubeUrl || '',
            user: participant.user,
          };

          return (
            <section key={participant.id} className="pt-2">
              <JudgeScoreForm
                wildcard={wildcardProp as any}
                assignment={selectedAssignment}
                criterios={relevantCriterios}
                existingScore={existingScore || null}
              />
              <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </section>
          );
        })}
      </div>
    );
  };

  // ---------- BATALLAS ----------
  const renderBattleForms = () => {
    if (!selectedAssignment) return null;

    const relevantBattles = battles
      .filter(b =>
        b.eventoId === selectedAssignment.eventoId &&
        b.categoriaId === selectedAssignment.categoriaId &&
        b.phase === selectedAssignment.phase
      )
      .sort((a, b) => a.orderInRound - b.orderInRound);

    if (relevantBattles.length === 0) {
      return <p className="text-blue-100/70 italic px-2">Las llaves de batalla para esta fase aún no han sido generadas por el administrador.</p>
    }

    return (
      <div className="flex flex-col gap-20">
        {relevantBattles.map(battle => (
          <section key={battle.id} className="pt-2">
            <BattleScoreForm
              battle={battle}
              assignment={selectedAssignment}
              criterios={relevantCriterios}
              initialScores={initialScores.filter(s => s.battleId === battle.id)}
            />
            <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </section>
        ))}
      </div>
    );
  };

  // ---------- LAYOUT FLUIDO (sin tarjetas) ----------
  return (
    <div
      className="
        relative px-5 md:px-10 py-8 md:py-12 bg-[#0b0b10] text-blue-50 space-y-10
        before:pointer-events-none before:absolute before:inset-0
        before:bg-[radial-gradient(90%_60%_at_10%_0%,rgba(124,58,237,0.10),transparent_60%),radial-gradient(80%_55%_at_90%_0%,rgba(56,189,248,0.08),transparent_55%)]
      "
    >
      {/* encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <PanelTag text="Panel de evaluación" />
          {selectedAssignment && (
            <div className="flex items-center gap-2">
              <PhaseBadge phase={selectedAssignment.phase} />
              <span className="text-xs text-blue-100/70">
                {selectedAssignment.evento.nombre} · {selectedAssignment.categoria.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* selector */}
      <div className="max-w-xl">
        <label
          htmlFor="assignment"
          className="block text-xs font-semibold uppercase tracking-wider text-blue-100/80 mb-2"
        >
          Selecciona una evaluación
        </label>
        <div className="relative">
          <select
            id="assignment"
            name="assignment"
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="
              w-full appearance-none rounded-xl border border-white/10 bg-[#0c0c12]/80 px-3 py-2.5
              text-sm shadow-sm outline-none
              focus:border-fuchsia-400/40 focus:ring-2 focus:ring-fuchsia-400/30
            "
          >
            {assignments.length === 0 && <option>No hay tareas</option>}
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {a.evento.nombre} - {a.categoria.name} ({a.phase})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sky-300/80">▾</div>
        </div>
      </div>

      {/* separador */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* contenido */}
      {selectedAssignment && (
        <div className="space-y-12">
          <AnimatePresence mode="popLayout">
            {isBattlePhase ? renderBattleForms() : renderShowcaseForms()}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
// (sin cambios de lógica; solo estilo)
