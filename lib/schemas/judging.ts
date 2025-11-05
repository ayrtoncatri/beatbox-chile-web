// lib/schemas/judging.ts
import { z } from 'zod'
// Importa los enums generados por Prisma
import { RoundPhase, ScoreStatus } from '@prisma/client' 

// Valida cada criterio individual (ej: { criterioId: '...', value: 30 })
export const scoreDetailSchema = z.object({
  criterioId: z.string().cuid('ID de criterio inválido'),
  value: z.number().int().min(0, 'El puntaje no puede ser negativo'),
});

// Valida el formulario completo que envía el juez
export const submitScoreSchema = z.object({
  eventoId: z.string().cuid('ID de evento inválido'),
  categoriaId: z.string().cuid('ID de categoría inválido'),
  phase: z.nativeEnum(RoundPhase),
  participantId: z.string().cuid('ID de participante inválido'),
  
  // Esperamos un array de puntajes por criterio
  scores: z.array(scoreDetailSchema).min(1, 'Se requiere al menos un criterio'),
  
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
  status: z.nativeEnum(ScoreStatus), // Para el autosave
});

// Exportamos el tipo para usarlo en nuestro formulario
export type SubmitScorePayload = z.infer<typeof submitScoreSchema>