import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, ConnectionMode, EdgeTypes, ConnectionLineType, BackgroundVariant, useReactFlow, NodeTypes, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import CollapsibleStatsPanel from './CollapsibleStatsPanel';
import EquipmentNode from './nodes/EquipmentNode';
import ConfigurableEdge from './edges/ConfigurableEdge';
import ConnectionAlert from './ConnectionAlert';
import { useFactorySimulation } from '@/hooks/useFactorySimulation';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useGridOperations } from '@/hooks/useGridOperations';
import { useNodeOperations } from '@/hooks/useNodeOperations';
const nodeTypes: NodeTypes = {
  equipment: EquipmentNode
};
const edgeTypes: EdgeTypes = {
  default: ConfigurableEdge
};
interface FactoryEditorProps {
  isSimulating: boolean;
  simulationMode?: "instant" | "play-by-play";
  simulationSpeed?: number;
  onUnitPositionUpdate?: (position: {
    nodeId: string;
    progress: number;
  } | null) => void;
}
const FactoryEditorContent = ({
  isSimulating,
  simulationMode = "instant",
  simulationSpeed = 1,
  onUnitPositionUpdate
}: FactoryEditorProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    getNodes
  } = useReactFlow();
  const {
    currentUnitPosition,
    startPlayByPlaySimulation
  } = useFactorySimulation({
    isSimulating,
    simulationMode,
    simulationSpeed,
    onUnitPositionUpdate
  });
  const {
    placeholderNode,
    onDrop,
    onDragOver,
    onDragLeave
  } = useDragAndDrop();
  const {
    findBestNodePosition,
    onNodeDragStopGrid
  } = useGridOperations(snapToGrid, setNodes);
  const {
    pendingConnection,
    setPendingConnection,
    showConnectionAlert,
    setShowConnectionAlert,
    onConnect,
    onConnectStart,
    onConnectEnd,
    handleAddFromConnection,
    onNodesDelete
  } = useNodeOperations(setNodes, setEdges);
  useEffect(() => {
    const handleEdgeUpdate = (event: CustomEvent) => {
      const {
        id,
        data,
        label
      } = event.detail;
      setEdges(edges => edges.map(e => {
        if (e.id === id) {
          return {
            ...e,
            data,
            label
          };
        }
        return e;
      }));
    };
    document.addEventListener('edge:update', handleEdgeUpdate as EventListener);
    return () => {
      document.removeEventListener('edge:update', handleEdgeUpdate as EventListener);
    };
  }, [setEdges]);
  const onInit = useCallback((instance: any) => {
    setReactFlowInstance(instance);
  }, []);
  const handleNodeDragStopWithGrid = useCallback((event: any, node: any) => {
    onNodeDragStopGrid(event, node, nodes);
  }, [onNodeDragStopGrid, nodes]);
  const handleDrop = useCallback((event: React.DragEvent) => {
    onDrop(event, reactFlowInstance, reactFlowWrapper);
  }, [onDrop, reactFlowInstance]);
  const handleDragOver = useCallback((event: React.DragEvent) => {
    onDragOver(event, reactFlowInstance, reactFlowWrapper);
  }, [onDragOver, reactFlowInstance]);
  const handleAddFromConnectionWithNodes = useCallback((equipment: any) => {
    handleAddFromConnection(equipment, nodes);
  }, [handleAddFromConnection, nodes]);
  return <div className="w-full h-full flex flex-col">
      <div className="">
        <CollapsibleStatsPanel isSimulating={isSimulating} simulationTime={0} throughput={75} efficiency={85} energyUsage={120} temperature={75} />
      </div>
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodesDelete={onNodesDelete} onConnect={onConnect} onConnectStart={onConnectStart} onConnectEnd={onConnectEnd} onInit={onInit} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={onDragLeave} onNodeDragStop={handleNodeDragStopWithGrid} nodeTypes={nodeTypes} edgeTypes={edgeTypes} defaultEdgeOptions={{
        type: 'default'
      }} connectionLineType={ConnectionLineType.SmoothStep} fitView connectionMode={ConnectionMode.Loose} attributionPosition="bottom-right" className="bg-muted/20" snapToGrid={snapToGrid} snapGrid={[20, 20]} defaultViewport={{
        x: 0,
        y: 0,
        zoom: 1
      }} deleteKeyCode={['Backspace', 'Delete']}>
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={showGrid ? 'currentColor' : 'transparent'} className="opacity-30" />
          <Controls />
          <MiniMap nodeColor={node => {
          if (isSimulating && node.data?.bottleneck) return '#ef4444';
          return '#1D4ED8';
        }} />
        </ReactFlow>
      </div>
      
      <ConnectionAlert open={showConnectionAlert} onOpenChange={setShowConnectionAlert} onCancel={() => setPendingConnection(null)} />
    </div>;
};
const FactoryEditor = (props: FactoryEditorProps) => {
  return <ReactFlowProvider>
      <FactoryEditorContent {...props} />
    </ReactFlowProvider>;
};
export default FactoryEditor;