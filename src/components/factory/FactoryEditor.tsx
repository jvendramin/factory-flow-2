
import { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from '@/components/ui/use-toast';
import EquipmentNode from './nodes/EquipmentNode';

// Define node types
const nodeTypes: NodeTypes = {
  equipment: EquipmentNode,
};

interface FactoryEditorProps {
  isSimulating: boolean;
}

const FactoryEditor = ({ isSimulating }: FactoryEditorProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Get equipment data from drag event
      const equipmentData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      
      if (typeof equipmentData.type !== 'string') {
        return;
      }

      // Get drop position within the pane
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      // Create a new node
      const newNode = {
        id: `equipment-${Date.now()}`,
        type: 'equipment',
        position,
        data: { ...equipmentData },
      };

      setNodes((nds) => nds.concat(newNode));
      toast({
        title: `Added ${equipmentData.name}`,
        description: `${equipmentData.name} has been added to the factory floor`,
      });
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="bg-muted/20"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            return isSimulating && node.data?.bottleneck ? '#ef4444' : '#1D4ED8';
          }}
        />
      </ReactFlow>
    </div>
  );
};

export default FactoryEditor;
