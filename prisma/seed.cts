const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando el script seed...')

  // 1. Crear Roles
  // ---------------------------------
  console.log('Creando Roles...')
  await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  })
  await prisma.role.upsert({
    where: { name: 'judge' },
    update: {},
    create: { name: 'judge' },
  })
  await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' },
  }),
  await prisma.role.upsert({
    where: { name: 'participant' },
    update: {},
    create: { name: 'participant' },
  })
  

  // 2. Crear Tipos de Evento (EventType)
  // ---------------------------------
  console.log('Creando Tipos de Evento...')
  
  // Esta es nuestra "lista dorada" de tipos de evento
  const eventTypes = [
    // --- Tipos de Clasificación ---
    { name: 'Liga Presencial' },
    { name: 'Liga Online' },
    { name: 'Campeonato Nacional' },
    { name: 'Wildcard' },
    
    // --- Tipos Generales ---
    { name: 'Batalla' }, // (Tu BD ya lo tiene, 'upsert' lo ignorará)
    { name: 'Exhibición' }, // (Tu BD ya lo tiene)
    { name: 'Taller' }, // (Tu BD ya lo tiene)
  ];

  for (const tipo of eventTypes) {
    const eventType = await prisma.eventType.upsert({
      where: { name: tipo.name }, // Busca por nombre
      update: {}, // Si existe, no hagas nada
      create: { name: tipo.name }, // Si no existe, créalo
    });
    console.log(`Tipo de evento asegurado: ${eventType.name}`);
  }

  // 3. Crear Categorías
  // ---------------------------------
  console.log('Creando Categorías...')
  const catSolo = await prisma.categoria.upsert({
    where: { name: 'SOLO' },
    update: {},
    create: { name: 'SOLO', description: 'Competencia individual' },
  })
  
  const catLoop = await prisma.categoria.upsert({
    where: { name: 'LOOPSTATION' },
    update: {},
    create: { name: 'LOOPSTATION', description: 'Competencia con loopera' },
  })
  
  const catTag = await prisma.categoria.upsert({
    where: { name: 'TAG_TEAM' },
    update: {},
    create: { name: 'TAG_TEAM', description: 'Competencia en parejas' },
  })

  // 4. Crear Criterios (Basado en Rúbricas Excel)
  // ---------------------------------
  
  // == CRITERIOS "SOLO" (Rangos 0-40, 0-20, 0-5) ==
  console.log('Creando Criterios para SOLO...')
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Originalidad', categoriaId: catSolo.id } },
    update: {},
    create: { 
      name: 'Originalidad', 
      description: 'Creatividad, estilo único, sonidos y patrones no convencionales.', 
      maxScore: 40, // Rango 0-40
      categoriaId: catSolo.id 
    },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Musicalidad', categoriaId: catSolo.id } },
    update: {},
    create: { 
      name: 'Musicalidad', 
      description: 'Ritmo, fluidez, estructura de la canción, composición y dinámica.', 
      maxScore: 20, // Rango 0-20
      categoriaId: catSolo.id 
    },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Técnica', categoriaId: catSolo.id } },
    update: {},
    create: { 
      name: 'Técnica', 
      description: 'Limpieza, complejidad, dificultad y claridad de los sonidos.', 
      maxScore: 20, // Rango 0-20
      categoriaId: catSolo.id 
    },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Performance', categoriaId: catSolo.id } },
    update: {},
    create: { 
      name: 'Performance', 
      description: 'Presencia escénica, entrega, conexión con el público (o cámara), carisma.', 
      maxScore: 20, // Rango 0-20
      categoriaId: catSolo.id 
    },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Bonus', categoriaId: catSolo.id } },
    update: {},
    create: { 
      name: 'Bonus', 
      description: 'Factor "wow", impacto general, algo extra que impresione.', 
      maxScore: 5, // Rango 0-5
      categoriaId: catSolo.id 
    },
  })

  // == CRITERIOS "LOOPSTATION" (Rangos 0-20, Bonus 0-5) ==
  console.log('Creando Criterios para LOOPSTATION...')
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Originalidad y Estilo', categoriaId: catLoop.id } },
    update: {},
    create: { name: 'Originalidad y Estilo', description: 'Estilo único, sonidos, uso creativo del equipo.', maxScore: 20, categoriaId: catLoop.id },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Composición y Estructura', categoriaId: catLoop.id } },
    update: {},
    create: { name: 'Composición y Estructura', description: 'Arreglo de la canción, build-ups, drops, transiciones.', maxScore: 20, categoriaId: catLoop.id },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Técnica y Control del Equipo', categoriaId: catLoop.id } },
    update: {},
    create: { name: 'Técnica y Control del Equipo', description: 'Habilidad vocal, control del looper, live performance.', maxScore: 20, categoriaId: catLoop.id },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Sonido y Calidad de Producción', categoriaId: catLoop.id } },
    update: {},
    create: { name: 'Sonido y Calidad de Producción', description: 'Claridad del sonido, mezcla, calidad de audio.', maxScore: 20, categoriaId: catLoop.id },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Performance', categoriaId: catLoop.id } },
    update: {},
    create: { name: 'Performance', description: 'Presencia escénica, energía, conexión.', maxScore: 20, categoriaId: catLoop.id },
  })
    await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Bonus', categoriaId: catLoop.id } },
    update: {},
    create: { name: 'Bonus', description: 'Factor "wow", impacto general.', maxScore: 5, categoriaId: catLoop.id },
  })
    
  // == CRITERIOS "TAG_TEAM" (Rangos 0-20, Bonus 0-5) ==
  console.log('Creando Criterios para TAG_TEAM...')
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Originalidad', categoriaId: catTag.id } },
    update: {},
    create: { name: 'Originalidad', description: 'Creatividad, estilo único, sonidos y patrones no convencionales.', maxScore: 20, categoriaId: catTag.id },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Musicalidad', categoriaId: catTag.id } },
    update: {},
    create: { name: 'Musicalidad', description: 'Ritmo, fluidez, estructura de la canción, composición y dinámica.', maxScore: 20, categoriaId: catTag.id },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Técnica', categoriaId: catTag.id } },
    update: {},
    create: { name: 'Técnica', description: 'Limpieza, complejidad, dificultad y claridad de los sonidos.', maxScore: 20, categoriaId: catTag.id },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Performance', categoriaId: catTag.id } },
    update: {},
    create: { name: 'Performance', description: 'Presencia escénica, entrega, conexión con el público (o cámara), carisma.', maxScore: 20, categoriaId: catTag.id },
  })
  await prisma.criterio.upsert({
    where: { name_categoriaId: { name: 'Bonus', categoriaId: catTag.id } },
    update: {},
    create: { name: 'Bonus', description: 'Factor "wow", impacto general, algo extra que impresione.', maxScore: 5, categoriaId: catTag.id },
  })

  console.log('¡Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })