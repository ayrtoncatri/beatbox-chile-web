'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { InscripcionSource, RoundPhase } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Importamos tu config de auth

// Tipo de estado para el formulario
interface ActionState {
  error?: string;
  success?: string;
  log?: string[]; // Log para mostrar el proceso al admin
}

// Constantes de negocio
const CN_EVENT_TYPE = "Campeonato Nacional";
const LIGA_PRESENCIAL_TYPE = "Liga Presencial";
const LIGA_ONLINE_TYPE = "Liga Online";
const WILDCARD_EVENT_TYPE = "Wildcard"; // Asumo que tus wildcards están en un evento tipo "Wildcard"
const CATEGORIA_PRINCIPAL = "SOLO"; // Asumo que la categoría principal es "SOLO"

/**
 * Función helper para obtener el Top 3 (IDs) de un evento finalizado
 */
async function getTop3(eventoId: string) {
  const scores = await prisma.score.groupBy({
    by: ['participantId'],
    where: {
      eventoId: eventoId,
      phase: RoundPhase.FINAL, // El Top 3 se decide en la FINAL
    },
    _avg: {
      totalScore: true, // Promedio de las notas de los jueces
    },
    orderBy: {
      _avg: {
        totalScore: 'desc',
      },
    },
    take: 3,
  });
  return scores.map(s => s.participantId);
}

/**
 * Acción principal que ejecuta la clasificación al Campeonato Nacional
 */
export async function runCnClassification(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  
  let log: string[] = ['Iniciando proceso...'];

  // --- 1. Seguridad: Verificar Sesión de Admin ---
  const session = await getServerSession(authOptions);
  const userRoles = (session?.user as any)?.roles || [];
  if (!session?.user?.id || !userRoles.includes('admin')) {
    return { error: 'No autorizado. Se requiere ser administrador.', log };
  }
  log.push(`Verificado admin: ${session.user.email}`);

  // --- 2. Validación de Inputs ---
  const Schema = z.object({
    cnEventoId: z.string().cuid('Debe seleccionar un evento de CN válido.'),
    year: z.coerce.number().min(2020, 'Año no válido').max(2100, 'Año no válido'),
  });

  const validatedFields = Schema.safeParse({
    cnEventoId: formData.get('cnEventoId'),
    year: formData.get('year'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message, log };
  }
  
  const { cnEventoId, year } = validatedFields.data;
  log.push(`Clasificando para el CN (ID: ${cnEventoId}) del ciclo ${year}...`);

  try {
    let qualifiedUserIds = new Set<string>();

    // --- 3. Obtener eventos relevantes del ciclo ---
    const prevCn = await prisma.evento.findFirst({
      where: { tipo: { name: CN_EVENT_TYPE }, fecha: { lt: new Date(`${year}-01-01`) } },
      orderBy: { fecha: 'desc' }
    });
    const ligaPresencial = await prisma.evento.findFirst({
      where: { tipo: { name: LIGA_PRESENCIAL_TYPE }, fecha: { gte: new Date(`${year}-01-01`), lt: new Date(`${year+1}-01-01`) } },
      orderBy: { fecha: 'desc' }
    });
    const ligaOnline = await prisma.evento.findFirst({
      where: { tipo: { name: LIGA_ONLINE_TYPE }, fecha: { gte: new Date(`${year}-01-01`), lt: new Date(`${year+1}-01-01`) } },
      orderBy: { fecha: 'desc' }
    });
    const wildcardEvent = await prisma.evento.findFirst({ // Asumo que hay UN evento de wildcard por año
      where: { tipo: { name: WILDCARD_EVENT_TYPE }, fecha: { gte: new Date(`${year}-01-01`), lt: new Date(`${year+1}-01-01`) } },
      orderBy: { fecha: 'desc' }
    });

    if (!prevCn) log.push('Advertencia: No se encontró CN anterior.');
    if (!ligaPresencial) log.push('Advertencia: No se encontró Liga Presencial de este año.');
    if (!ligaOnline) log.push('Advertencia: No se encontró Liga Online de este año.');
    if (!wildcardEvent) log.push('Advertencia: No se encontró evento de Wildcard de este año.');

    // --- 4. Buscar Clasificados (Top 3) ---
    let top3CnAnterior: string[] = [];
    if (prevCn) {
      top3CnAnterior = await getTop3(prevCn.id);
      top3CnAnterior.forEach(id => qualifiedUserIds.add(id));
      log.push(`Clasificados CN Anterior (${prevCn.nombre}): ${top3CnAnterior.length} encontrados.`);
    }

    let top3LigaPresencial: string[] = [];
    if (ligaPresencial) {
      top3LigaPresencial = await getTop3(ligaPresencial.id);
      top3LigaPresencial.forEach(id => qualifiedUserIds.add(id));
      log.push(`Clasificados Liga Presencial (${ligaPresencial.nombre}): ${top3LigaPresencial.length} encontrados.`);
    }

    let top3LigaOnline: string[] = [];
    if (ligaOnline) {
      top3LigaOnline = await getTop3(ligaOnline.id);
      top3LigaOnline.forEach(id => qualifiedUserIds.add(id));
      log.push(`Clasificados Liga Online (${ligaOnline.nombre}): ${top3LigaOnline.length} encontrados.`);
    }

    // --- 5. Buscar Clasificados (Top 7 Wildcards) ---
    let top7Wildcards: string[] = [];
    if (wildcardEvent) {
      // Asumimos que el admin marcó 'isClassified' = true a los 7 ganadores
      const classifiedWildcards = await prisma.wildcard.findMany({
        where: {
          eventoId: wildcardEvent.id,
          isClassified: true, // El admin debe setear esto
        },
        select: { userId: true },
        take: 7,
      });
      top7Wildcards = classifiedWildcards.map(w => w.userId);
      top7Wildcards.forEach(id => qualifiedUserIds.add(id));
      log.push(`Clasificados Wildcard (${wildcardEvent.nombre}): ${top7Wildcards.length} encontrados.`);
    }

    // --- 6. Consolidar y Crear Inscripciones ---
    const finalUserIds = Array.from(qualifiedUserIds);
    log.push(`Total de clasificados únicos: ${finalUserIds.length}`);

    if (finalUserIds.length === 0) {
      return { error: 'No se encontraron clasificados.', log };
    }

    const categoriaSolo = await prisma.categoria.findUnique({
      where: { name: CATEGORIA_PRINCIPAL }
    });
    if (!categoriaSolo) return { error: `Categoría "${CATEGORIA_PRINCIPAL}" no encontrada.`, log };

    // Obtenemos los nombres artísticos para el snapshot
    const users = await prisma.user.findMany({
      where: { id: { in: finalUserIds } },
      select: {
        id: true,
        inscripciones: { select: { nombreArtistico: true }, orderBy: { createdAt: 'desc' }, take: 1 },
        wildcards: { select: { nombreArtistico: true }, orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    const dataToCreate = users.map(user => {
      const nombreArtistico = user.inscripciones[0]?.nombreArtistico || user.wildcards[0]?.nombreArtistico || 'Clasificado';
      
      let source: InscripcionSource = InscripcionSource.CN_ADMIN;
      if (top7Wildcards.includes(user.id)) source = InscripcionSource.WILDCARD;
      if (top3LigaOnline.includes(user.id)) source = InscripcionSource.LIGA_ONLINE_TOP3;
      if (top3LigaPresencial.includes(user.id)) source = InscripcionSource.LIGA_PRESENCIAL_TOP3;
      if (top3CnAnterior.includes(user.id)) source = InscripcionSource.CN_HISTORICO_TOP3;

      return {
        userId: user.id,
        eventoId: cnEventoId,
        categoriaId: categoriaSolo.id,
        nombreArtistico: nombreArtistico,
        source: source,
      };
    });

    const result = await prisma.inscripcion.createMany({
      data: dataToCreate,
      skipDuplicates: true, // ¡Importante! No inscribe al mismo usuario dos veces
    });

    log.push(`¡Éxito! Se crearon ${result.count} nuevas inscripciones para el CN.`);
    revalidatePath('/admin/inscripciones');
    revalidatePath(`/historial-competitivo/eventos/${cnEventoId}`);

    return { success: `Proceso completado. ${result.count} participantes inscritos.`, log };

  } catch (error) {
    console.error('Error en la clasificación del CN:', error);
    return { error: 'Error del servidor al ejecutar la clasificación.', log };
  }
}