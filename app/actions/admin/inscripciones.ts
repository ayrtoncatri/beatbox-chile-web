'use server';

import { prisma }from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
// --- CORRECCIÓN 1: Importar 'Prisma' ---
import { InscripcionSource, Prisma } from '@prisma/client';

// Esquema de validación (sin cambios)
const RegistrationSchema = z.object({
  userId: z.string().cuid('Usuario no válido'),
  eventoId: z.string().cuid('Evento no válido'),
  categoriaId: z.string().cuid('Categoría no válida'),
  nombreArtistico: z.string().min(2, 'Nombre artístico requerido').max(100),
});

// Estado de la acción (sin cambios)
interface ActionState {
  error?: string;
  success?: string;
}

// Función 'registerParticipantForLeague' (sin cambios)
export async function registerParticipantForLeague(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  
  const validatedFields = RegistrationSchema.safeParse({
    userId: formData.get('userId'),
    eventoId: formData.get('eventoId'),
    categoriaId: formData.get('categoriaId'),
    nombreArtistico: formData.get('nombreArtistico'),
  });

  if (!validatedFields.success) {
    return { error: 'Datos inválidos. Por favor, revise el formulario.' };
  }

  const { userId, eventoId, categoriaId, nombreArtistico } = validatedFields.data;

  try {
  
    const existingRegistration = await prisma.inscripcion.findUnique({
      where: {
        userId_eventoId_categoriaId: {
          userId,
          eventoId,
          categoriaId,
        },
      },
    });

    if (existingRegistration) {
      return { error: 'Este usuario ya está inscrito en esta categoría del evento.' };
    }

    await prisma.inscripcion.create({
      data: {
        userId,
        eventoId,
        categoriaId,
        nombreArtistico: nombreArtistico,
        source: InscripcionSource.LIGA_ADMIN,
        wildcardId: null,
      },
    });

    revalidatePath('/admin/inscripciones');
    revalidatePath(`/historial-competitivo/eventos/${eventoId}`);
    revalidatePath(`/admin/eventos/${eventoId}`);
    return { success: '¡Participante inscrito exitosamente!' };

  } catch (error) {
    console.error('Error al inscribir participante:', error);
    if ((error as any).code === 'P2002') {
       return { error: 'Este usuario ya está inscrito en esta categoría del evento.' };
    }
    return { error: 'No se pudo completar la inscripción. Error del servidor.' };
  }
}


// --- CORRECCIÓN 2: Definir tipos explícitos para los datos ---
// Este tipo representa la "forma" exacta del objeto 'user' que pedimos
type UserForForm = Prisma.UserGetPayload<{
  select: {
    id: true,
    email: true,
    profile: {
      select: { nombres: true, apellidoPaterno: true }
    }
  }
}>

// Este tipo representa la "forma" exacta del objeto 'liga' que pedimos
type LigaForForm = Prisma.EventoGetPayload<{
  select: {
    id: true,
    nombre: true,
    categories: { 
      select: {
        categoria: {
          select: { id: true, name: true }
        }
      }
    }
  }
}>


/**
 * Carga los datos necesarios para poblar los <select> del formulario.
 */
export async function getRegistrationFormData() {
  
  // 1. Obtener Ligas (sin cambios)
  const ligas = await prisma.evento.findMany({
    where: {
      isPublished: true,
      tipo: {
        name: { in: ['Liga Presencial', 'Liga Online'] }
      }
    },
    select: {
      id: true,
      nombre: true,
      categories: { 
        select: {
          categoria: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { fecha: 'desc' }
  });

  // 2. Obtener todos los usuarios activos (sin cambios)
  const users = await prisma.user.findMany({
    where: { isActive: true }, 
    select: {
      id: true,
      email: true,
      profile: {
        select: { nombres: true, apellidoPaterno: true }
      }
    },
    orderBy: { profile: { nombres: 'asc' } } 
  });

  // 3. Mapear los datos para que el formulario los use fácilmente
  
  // --- CORRECCIÓN 3: Aplicar el tipo 'UserForForm' al parámetro 'u' ---
  const usersList = users.map((u: UserForForm) => ({
    id: u.id,
    name: `${u.profile?.nombres || ''} ${u.profile?.apellidoPaterno || ''} (${u.email})`.trim(),
  }));

  // --- CORRECCIÓN 4: Aplicar el tipo 'LigaForForm' al parámetro 'liga' ---
  const ligasMap = ligas.map((liga: LigaForForm) => ({
    id: liga.id,
    nombre: liga.nombre,
    // (Ahora 'c' se inferirá correctamente, ya que 'liga.categories' tiene tipo)
    categorias: liga.categories.map(c => c.categoria)
  }));
  
  return { ligas: ligasMap, users: usersList };
}