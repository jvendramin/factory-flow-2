
import { useState, useCallback, useRef } from 'react';
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
  Node,
  XYPosition,
  useReactFlow,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from '@/components/ui/use-toast';
import EquipmentNode from './nodes/EquipmentNode';
import { Equipment } from '@/types/equipment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowRightCircle } from 'lucide-react';

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
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [placeholderNode, setPlaceholderNode] = useState<Node | null>(null);
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);
  
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onNodeChanges = useCallback((changes: NodeChange[]) => {
    // Custom node change handling to support placeholder
    onNodesChange(changes);
  }, [onNodesChange]);

  const onEdgeChanges = useCallback((changes: EdgeChange[]) => {
    // Custom edge change handling
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const onConnectStart = useCallback(() => {
    // Handle connection start
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent) => {
    // If there's no valid target node, show connection alert
    const targetIsPane = (event.target as Element).classList.contains('react-flow__pane');
    if (targetIsPane) {
      // Get connection source
      const edgeExists = edges.some(e => e.source === nodes[nodes.length - 1]?.id);
      if (!edgeExists && nodes.length > 0) {
        const sourceNodeId = nodes[nodes.length - 1].id;
        setPendingConnection({
          source: sourceNodeId,
          target: '',
          sourceHandle: null,
          targetHandle: null,
        });
        setShowConnectionAlert(true);
      }
    }
  }, [nodes, edges]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setPlaceholderNode(null);

      if (!reactFlowInstance || !reactFlowWrapper.current) {
        return;
      }

      // Get equipment data from drag event
      const equipmentData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      
      if (typeof equipmentData.type !== 'string') {
        return;
      }

      // Get drop position within the pane
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

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
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    if (!reactFlowInstance || !reactFlowWrapper.current) {
      return;
    }
    
    try {
      // Get equipment data from drag event
      const jsonData = event.dataTransfer.getData('application/reactflow');
      if (!jsonData) return;
      
      const equipmentData = JSON.parse(jsonData);
      
      // Calculate placement position
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      // Show placeholder node
      if (!placeholderNode) {
        const placeholder = {
          id: 'placeholder',
          type: 'equipment',
          position,
          data: { 
            ...equipmentData,
            name: `${equipmentData.name} (Preview)`,
            placeholder: true 
          },
          className: 'opacity-50 border-dashed',
        };
        setPlaceholderNode(placeholder);
        setNodes(nds => [...nds.filter(n => n.id !== 'placeholder'), placeholder]);
      } else {
        // Update placeholder position
        setNodes(nds => 
          nds.map(n => {
            if (n.id === 'placeholder') {
              return {
                ...n,
                position,
              };
            }
            return n;
          })
        );
      }
    } catch (err) {
      // Silent error for drag over - this is expected if no data is available yet
    }
    
  }, [reactFlowInstance, placeholderNode, setNodes]);
  
  const onDragLeave = useCallback(() => {
    // Remove placeholder node when drag leaves
    if (placeholderNode) {
      setNodes(nds => nds.filter(n => n.id !== 'placeholder'));
      setPlaceholderNode(null);
    }
  }, [placeholderNode, setNodes]);
  
  const findBestNodePosition = useCallback((): XYPosition => {
    // Find the rightmost node
    let maxX = 0;
    let avgY = 0;
    
    if (nodes.length === 0) {
      return { x: 100, y: 200 };
    }
    
    nodes.forEach(node => {
      if (node.position.x > maxX) {
        maxX = node.position.x;
      }
      avgY += node.position.y;
    });
    
    avgY = avgY / nodes.length;
    
    // Position the new node to the right with some spacing
    return { x: maxX + 250, y: avgY };
  }, [nodes]);
  
  const handleAddFromConnection = useCallback((equipment: Equipment) => {
    if (!pendingConnection || !pendingConnection.source) return;
    
    const position = findBestNodePosition();
    
    // Create a new node at the calculated position
    const newNode = {
      id: `equipment-${Date.now()}`,
      type: 'equipment',
      position,
      data: { ...equipment },
    };
    
    setNodes((nds) => nds.concat(newNode));
    
    // Create the connection
    const connection = {
      ...pendingConnection,
      target: newNode.id,
    };
    
    setEdges((eds) => addEdge(connection, eds));
    
    toast({
      title: `Added ${equipment.name}`,
      description: `${equipment.name} has been connected to the previous node`,
    });
    
    setPendingConnection(null);
    setShowConnectionAlert(false);
  }, [pendingConnection, findBestNodePosition, setNodes, setEdges]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodeChanges}
        onEdgesChange={onEdgeChanges}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        nodeTypes={nodeTypes}
        fitView
        connectionMode={ConnectionMode.Loose}
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
      
      <AlertDialog open={showConnectionAlert} onOpenChange={setShowConnectionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Connected Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to add a new piece of equipment and connect it to the source?
              Choose the equipment you want to add from the sidebar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              toast({
                title: "Select from sidebar",
                description: "Drag an equipment item from the sidebar to connect it",
                action: (
                  <div className="flex items-center">
                    <ArrowRightCircle className="h-4 w-4 mr-2" />
                    <span>Drag from sidebar</span>
                  </div>
                ),
              });
              setShowConnectionAlert(false);
            }}>
              Choose Equipment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FactoryEditor;
