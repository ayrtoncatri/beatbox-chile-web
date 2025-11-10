'use client';

import { useState, useEffect } from 'react';
import {
  PublicBracketData,
  getPublicEventBracket,
} from '@/app/actions/public-data';
import { RoundPhase } from '@prisma/client';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BracketMatch } from './BracketMatch';

// --- 1. Nodo de Título ---
function TitleNode({ data }: { data: { label: string } }) {
  return (
    <div className="relative flex justify-center">
      {/* Fondo borroso con opacidad */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl shadow-[0_0_12px_rgba(255,255,255,0.4)]" />

      {/* Texto del título */}
      <h3
        className="relative px-4 py-1 text-3xl font-extrabold text-center uppercase tracking-widest
                   text-[#D6160F] drop-shadow-[2px_2px_6px_rgba(0,0,0,0.9)]"
      >
        {data.label}
      </h3>
    </div>
  );
}
// ---------------------------------

// 2. Definir constantes de layout
const NODE_WIDTH = 256;         // igual
const NODE_HEIGHT = 120;        // ↓ de 120  → nodos más bajos
const HORIZONTAL_GAP = 250;     // igual
const VERTICAL_GAP = 72;        // ↑ de 60   → más aire entre nodos
const TITLE_HEIGHT = 80;  

// 3. Definir el orden de las fases
const MAIN_PHASES_ORDER: RoundPhase[] = [
  'PRELIMINAR', 'OCTAVOS', 'CUARTOS', 'SEMIFINAL', 'FINAL'
];
const THIRD_PLACE_PHASE: RoundPhase = 'TERCER_LUGAR';

// 4. Definir los tipos de nodos personalizados
const nodeTypes = {
  bracketMatch: BracketMatch,
  titleNode: TitleNode, 
};

// Estilo de línea azul para ganadores
const winnerEdgeStyle = {
  stroke: '#0A37D2',
  strokeWidth: 3,
  filter: 'drop-shadow(0 0 5px #0A37D2)',
};
// Línea roja punteada para perdedores
const loserEdgeStyle = {
  stroke: '#D6160F',
  strokeWidth: 2,
  strokeDasharray: '5 5', // Punteado
  filter: 'drop-shadow(0 0 3px #D6160F)',
};

interface EventBracketProps {
  initialData: PublicBracketData;
  eventoId: string;
}

export function EventBracket({ initialData, eventoId }: EventBracketProps) {
  const [data, setData] = useState(initialData);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 5. Lógica de Polling (actualiza 'data')
  useEffect(() => {
    const reFetchData = async () => {
      const newData = await getPublicEventBracket(eventoId);
      if (newData) {
        setData(prevData => (JSON.stringify(newData) !== JSON.stringify(prevData) ? newData : prevData));
      }
    };
    const intervalId = setInterval(reFetchData, 30000);
    return () => clearInterval(intervalId);
  }, [eventoId]);

  // 6. EL CEREBRO: Transformar 'data' en Nodos y Líneas
  useEffect(() => {
    if (!data) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let x = 0;

    const mainPhaseColumns = MAIN_PHASES_ORDER
      .map(phase => ({ phase, battles: data[phase] }))
      .filter(col => col.battles && col.battles.length > 0);
    
    const thirdPlaceColumn = data[THIRD_PLACE_PHASE] 
      ? { phase: THIRD_PLACE_PHASE, battles: data[THIRD_PLACE_PHASE] } 
      : null;

    if (mainPhaseColumns.length === 0) {
      setNodes([]); setEdges([]); return;
    }
      
  	// Cálculo de altura máxima basado en la primera columna
    const firstColLength = mainPhaseColumns[0].battles.length || 0;
    const maxHeight = firstColLength * (NODE_HEIGHT + VERTICAL_GAP);

    // --- 7. BUCLE PRINCIPAL (PRELIMINAR -> FINAL) ---
    mainPhaseColumns.forEach((column, colIndex) => {
      const { phase, battles } = column;
      const numBattles = battles.length;
      const isFirstColumn = colIndex === 0;

		// Centrado vertical de la columna
      const colHeight = numBattles * (NODE_HEIGHT + VERTICAL_GAP) - VERTICAL_GAP;
      const yOffset = (maxHeight - colHeight) / 2 + TITLE_HEIGHT;

      // AÑADIR NODO DE TÍTULO
      newNodes.push({
        id: `title-${phase}`,
        type: 'titleNode',
        position: { x, y: yOffset - TITLE_HEIGHT },
        data: { label: phase.replace('_', ' ') },
        draggable: false,
      });

      battles.forEach((battle, battleIndex) => {
        const y = yOffset + battleIndex * (NODE_HEIGHT + VERTICAL_GAP);
        const isFinalMatch = phase === 'FINAL' || phase === 'TERCER_LUGAR';

        // A. CREAR EL NODO
        newNodes.push({
          id: battle.id,
          type: 'bracketMatch',
          position: { x, y },
          draggable: false,
          data: {
            battle: battle,
            isFirstColumn: isFirstColumn,
            isFinalMatch: isFinalMatch,
            isSemifinal: phase === 'SEMIFINAL', // Importante para BracketMatch.tsx
          },
        });

        // B. CREAR LAS LÍNEAS (EDGES)
        // No crear líneas desde la SEMIFINAL (se maneja en Lógica Especial)
        if (phase !== 'SEMIFINAL' && colIndex < mainPhaseColumns.length - 1) {
          const nextColumnBattles = mainPhaseColumns[colIndex + 1].battles;
          const nextBattleIndex = Math.floor(battleIndex / 2);
          const nextBattle = nextColumnBattles[nextBattleIndex];

          if (nextBattle) {
            newEdges.push({
              id: `${battle.id}-to-${nextBattle.id}`,
              source: battle.id,
              target: nextBattle.id,
              type: 'smoothstep',
              animated: true,
              style: winnerEdgeStyle, // Línea de ganador
            });
          }
        }
      });
      x += NODE_WIDTH + HORIZONTAL_GAP;
    });

    // --- 8. LÓGICA ESPECIAL (3er LUGAR Y SEMIFINALES) ---
    // (Esta es la versión totalmente corregida)
    
    const semiFinalBattles = data['SEMIFINAL'];
    if (semiFinalBattles && semiFinalBattles.length === 2) {
      const finalBattle = data['FINAL']?.[0];
      const thirdPlaceBattle = thirdPlaceColumn?.battles?.[0];
      
      const semi1_Node = newNodes.find(n => n.id === semiFinalBattles[0].id);
      const semi2_Node = newNodes.find(n => n.id === semiFinalBattles[1].id);

      // Solo continuamos si tenemos todos los nodos y batallas necesarios
      if (semi1_Node && semi2_Node && finalBattle && thirdPlaceBattle) {
        
        // --- A. LÓGICA DE LAYOUT (BIFURCACIÓN SIMÉTRICA) ---

        // 1. Encontrar el punto medio vertical entre las dos semifinales
        const ySemi1_Center = semi1_Node.position.y + (NODE_HEIGHT / 2);
        const ySemi2_Center = semi2_Node.position.y + (NODE_HEIGHT / 2);
        const yMidPoint = (ySemi1_Center + ySemi2_Center) / 2;
        
        // 2. Definir la 'X' para la nueva columna
        const xPosFinalCol = semi1_Node.position.x + NODE_WIDTH + HORIZONTAL_GAP;

        // 3. Buscar el nodo de la FINAL (creado en el bucle 7) y REPOSICIONARLO
        const finalNode = newNodes.find(n => n.id === finalBattle.id);
        if (finalNode) {
          // Posición: Arriba del punto medio, con espacio
          finalNode.position.x = xPosFinalCol;
          finalNode.position.y = yMidPoint - (NODE_HEIGHT / 2) - (VERTICAL_GAP * 1.5); // Espacio extra
        }
        // Reposicionar el TÍTULO de la FINAL
        const finalTitle = newNodes.find(n => n.id === 'title-FINAL');
        if (finalTitle && finalNode) {
          finalTitle.position.x = xPosFinalCol;
          finalTitle.position.y = finalNode.position.y - TITLE_HEIGHT;
        }

        // 4. CREAR y POSICIONAR el NODO de 3ER LUGAR
        const yPos3rd = yMidPoint + (NODE_HEIGHT / 2) + (VERTICAL_GAP * 2.5); // Posición: Abajo del punto medio
        
        // Título de 3er Lugar
        newNodes.push({
            id: `title-${THIRD_PLACE_PHASE}`,
            type: 'titleNode',
            position: { x: xPosFinalCol, y: yPos3rd + NODE_HEIGHT + 12 }, // ↓ debajo, con margen
            data: { label: 'TERCER LUGAR' },
            draggable: false,
        });
        // Nodo de 3er Lugar
        newNodes.push({
          id: thirdPlaceBattle.id,
          type: 'bracketMatch',
          position: { x: xPosFinalCol, y: yPos3rd },
          draggable: false,
          data: {
            battle: thirdPlaceBattle,
            isFirstColumn: false,
            isFinalMatch: true, // Estilo de borde rojo
            isSemifinal: false,
          },
        });

        // --- B. LÓGICA DE LÍNEAS (EDGES) ---
     // (Lógica de conexión descruzada)

        // 1. LÍNEAS A LA FINAL (Azules, desde 'winner-out')
        newEdges.push({
          id: `${semiFinalBattles[0].id}-to-final`, 
          source: semiFinalBattles[0].id, 
          target: finalBattle.id, 		// Nodo de ARRIBA
          type: 'smoothstep', 
          animated: true, 
          style: winnerEdgeStyle, 		// Estilo AZUL
          sourceHandle: 'winner-out', 	// Handle de ARRIBA (25%)
        });
        newEdges.push({
          id: `${semiFinalBattles[1].id}-to-final`, 
          source: semiFinalBattles[1].id, 
          target: finalBattle.id, 		// Nodo de ARRIBA
          type: 'smoothstep', 
          animated: true, 
          style: winnerEdgeStyle, 		// Estilo AZUL
          sourceHandle: 'winner-out', 	// Handle de ARRIBA (25%)
        });

        // 2. LÍNEAS AL 3ER LUGAR (Rojas, desde 'loser-out')
        newEdges.push({
          id: `${semiFinalBattles[0].id}-to-third`, 
          source: semiFinalBattles[0].id, 
          target: thirdPlaceBattle.id, 	// Nodo de ABAJO
        	type: 'smoothstep', 
          animated: true, 
          style: loserEdgeStyle, 		// Estilo ROJO
          sourceHandle: 'loser-out', 	// Handle de ABAJO (75%)
        });
        newEdges.push({
          id: `${semiFinalBattles[1].id}-to-third`, 
          source: semiFinalBattles[1].id, 
          target: thirdPlaceBattle.id, 	// Nodo de ABAJO
          type: 'smoothstep', 
          animated: true, 
          style: loserEdgeStyle, 		// Estilo ROJO
          sourceHandle: 'loser-out', 	// Handle de ABAJO (75%)
        });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [data, setNodes, setEdges]);

  // 9. Estado de Carga / Vacío
  if (!data) return <p className="text-center text-gray-400 text-lg">Cargando datos del bracket...</p>;
  if (nodes.length === 0) return <p className="text-center text-gray-400 text-lg">Las llaves no han sido generadas.</p>;

  // 10. Renderizado (TRANSPARENTE)
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        elementsSelectable={false}
        fitViewOptions={{ padding: 0.2 }}
        className="bg-transparent" // Fondo transparente

      >
        <Panel position="top-center" className="text-purple-400 text-sm p-2 font-semibold">
          (Scroll horizontal habilitado para ver todas las fases)
        </Panel>
      </ReactFlow>
    </div>
  );
}