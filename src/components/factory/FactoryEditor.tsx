import { useState, useCallback, useRef, useEffect } from 'react';
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
  EdgeTypes,
  ConnectionLineType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from '@/components/ui/use-toast';
import EquipmentNode from './nodes/EquipmentNode';
import ConfigurableEdge from './edges/ConfigurableEdge';
import { Equipment, FlowEdge, PathStep } from '@/types/equipment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowRightCircle } from 'lucide-react';
import LiveStatsPanel from './LiveStatsPanel';

const nodeTypes: NodeTypes = {
  equipment: EquipmentNode,
};

const edgeTypes: EdgeTypes = {
  default: ConfigurableEdge,
};

interface FactoryEditorProps {
  isSimulating: boolean;
  simulationMode?: "instant" | "play-by-play";
  simulationSpeed?: number;
  onUnitPositionUpdate?: (position: { nodeId: string, progress: number } | null) => void;
}

const FactoryEditor = ({ 
  isSimulating, 
  simulationMode = "instant",
  simulationSpeed = 1,
  onUnitPositionUpdate
}: FactoryEditorProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [placeholderNode, setPlaceholderNode] = useState<Node | null>(null);
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [currentUnitPosition, setCurrentUnitPosition] = useState<{ nodeId: string, progress: number } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const activeEdgeRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (isSimulating && simulationMode === "play-by-play") {
      startPlayByPlaySimulation();
    } else if (!isSimulating && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      setCurrentUnitPosition(null);
      if (onUnitPositionUpdate) onUnitPositionUpdate(null);
      
      setNodes(nds => 
        nds.map(node => ({
          ...node,
          data: {
            ...node.data,
            active: false,
            utilization: undefined,
            progress: undefined
          }
        }))
      );
      
      setEdges(eds => 
        eds.map(e => ({
          ...e,
          data: {
            ...e.data,
            transitInProgress: false,
            transitProgress: 0
          }
        }))
      );
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isSimulating, simulationMode, setNodes, onUnitPositionUpdate, setEdges]);
  
  const startPlayByPlaySimulation = useCallback(() => {
    const flowPath: string[] = [];
    const edgeMap = new Map<string, { targetId: string, transitTime: number }[]>();
    
    edges.forEach(edge => {
      const sources = edgeMap.get(edge.source) || [];
      sources.push({ 
        targetId: edge.target, 
        transitTime: edge.data?.transitTime || 0 
      });
      edgeMap.set(edge.source, sources);
    });
    
    const allTargets = new Set(edges.map(e => e.target));
    const startNodeId = nodes.find(n => !allTargets.has(n.id))?.id;
    
    if (!startNodeId) {
      toast({
        title: "Simulation Error",
        description: "Could not identify the starting point of your process flow.",
        variant: "destructive"
      });
      return;
    }
    
    const fullPath: PathStep[] = [{ nodeId: startNodeId }];
    
    let currentNodeId = startNodeId;
    while (edgeMap.has(currentNodeId)) {
      const nextNodes = edgeMap.get(currentNodeId) || [];
      if (nextNodes.length === 0) break;
      
      const { targetId, transitTime } = nextNodes[0];
      fullPath.push({ 
        nodeId: targetId,
        transitTime
      });
      currentNodeId = targetId;
    }
    
    if (fullPath.length < 2) {
      toast({
        title: "Simulation Error",
        description: "Your process needs at least two connected equipment to run a simulation.",
        variant: "destructive"
      });
      return;
    }
    
    let currentPathIndex = 0;
    let progressWithinNode = 0;
    let inTransit = false;
    let transitProgress = 0;
    const nodeDataMap = new Map(nodes.map(n => [n.id, n.data]));
    
    lastTimestamp.current = 0;
    
    const animate = (timestamp: number) => {
      if (lastTimestamp.current === 0) {
        lastTimestamp.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const delta = (timestamp - lastTimestamp.current) / 1000;
      lastTimestamp.current = timestamp;
      
      if (currentPathIndex >= fullPath.length) {
        toast({
          title: "Simulation Complete",
          description: "Unit has completed the process flow."
        });
        
        const avgCycleTime = fullPath.reduce((total, step) => {
          const nodeData = nodeDataMap.get(step.nodeId);
          return total + (nodeData?.cycleTime || 0) + (step.transitTime || 0);
        }, 0);
        
        const throughput = Math.floor(3600 / avgCycleTime);
        
        let bottleneckId = fullPath[0].nodeId;
        let maxCycleTime = 0;
        
        fullPath.forEach(step => {
          const nodeData = nodeDataMap.get(step.nodeId);
          const cycleTime = nodeData?.cycleTime || 0;
          const maxCapacity = nodeData?.maxCapacity || 1;
          const adjustedCycleTime = maxCapacity > 1 ? cycleTime / maxCapacity : cycleTime;
          
          if (adjustedCycleTime > maxCycleTime) {
            maxCycleTime = adjustedCycleTime;
            bottleneckId = step.nodeId;
          }
        });
        
        setNodes(nds => 
          nds.map(node => {
            const nodeData = nodeDataMap.get(node.id);
            if (!nodeData) return node;
            
            const nodeCycleTime = nodeData.cycleTime || 0;
            const maxCapacity = nodeData.maxCapacity || 1;
            const adjustedCycleTime = maxCapacity > 1 ? nodeCycleTime / maxCapacity : nodeCycleTime;
            const utilization = Math.min(100, Math.round((adjustedCycleTime / maxCapacity) * 100));
            
            return {
              ...node,
              data: {
                ...node.data,
                active: false,
                utilization: utilization,
                bottleneck: node.id === bottleneckId
              }
            };
          })
        );
        
        return;
      }
      
      if (inTransit) {
        const currentStep = fullPath[currentPathIndex];
        const prevStep = fullPath[currentPathIndex - 1];
        
        if (!prevStep) {
          inTransit = false;
        } else {
          const transitTime = currentStep.transitTime || 0;
          
          if (transitTime <= 0) {
            inTransit = false;
            activeEdgeRef.current = null;
            
            setEdges(eds => 
              eds.map(e => ({
                ...e,
                data: {
                  ...e.data,
                  transitInProgress: false,
                  transitProgress: 0
                }
              }))
            );
          } else {
            const transitStep = delta * simulationSpeed / transitTime;
            transitProgress += transitStep;
            
            const edgeId = edges.find(
              e => e.source === prevStep.nodeId && e.target === currentStep.nodeId
            )?.id;
            
            if (edgeId) {
              activeEdgeRef.current = edgeId;
              
              setEdges(eds => 
                eds.map(e => ({
                  ...e,
                  data: {
                    ...e.data,
                    transitInProgress: e.id === edgeId,
                    transitProgress: e.id === edgeId ? transitProgress : 0
                  }
                }))
              );
            }
            
            if (onUnitPositionUpdate) onUnitPositionUpdate(null);
            
            if (transitProgress >= 1) {
              inTransit = false;
              transitProgress = 0;
              activeEdgeRef.current = null;
              
              setEdges(eds => 
                eds.map(e => ({
                  ...e,
                  data: {
                    ...e.data,
                    transitInProgress: false,
                    transitProgress: 0
                  }
                }))
              );
            } else {
              animationFrameRef.current = requestAnimationFrame(animate);
              return;
            }
          }
        }
      }
      
      const currentStep = fullPath[currentPathIndex];
      const currentNodeId = currentStep.nodeId;
      const currentNodeData = nodeDataMap.get(currentNodeId);
      
      if (!currentNodeData) {
        currentPathIndex++;
        inTransit = true;
        transitProgress = 0;
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const cycleDuration = currentNodeData.cycleTime * 1000 / simulationSpeed;
      const maxCapacity = currentNodeData.maxCapacity || 1;
      const adjustedCycleDuration = cycleDuration / maxCapacity;
      
      const stepSize = delta * 1000 / adjustedCycleDuration;
      progressWithinNode += stepSize;
      
      setNodes(nds => 
        nds.map(node => ({
          ...node,
          data: {
            ...node.data,
            active: node.id === currentNodeId,
            progress: node.id === currentNodeId ? Math.min(progressWithinNode, 1) : undefined
          }
        }))
      );
      
      setCurrentUnitPosition({ 
        nodeId: currentNodeId, 
        progress: Math.min(progressWithinNode, 1) 
      });
      
      if (onUnitPositionUpdate) {
        onUnitPositionUpdate({ 
          nodeId: currentNodeId, 
          progress: Math.min(progressWithinNode, 1) 
        });
      }
      
      if (progressWithinNode >= 1) {
        progressWithinNode = 0;
        currentPathIndex++;
        inTransit = true;
        transitProgress = 0;
        
        if (currentPathIndex < fullPath.length) {
          const currentNodeId = fullPath[currentPathIndex - 1].nodeId;
          const nextNodeId = fullPath[currentPathIndex].nodeId;
          
          const edgeId = edges.find(
            e => e.source === currentNodeId && e.target === nextNodeId
          )?.id;
          
          if (edgeId) {
            activeEdgeRef.current = edgeId;
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [edges, nodes, setNodes, simulationSpeed, onUnitPositionUpdate]);
  
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);
  
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => 
      addEdge({ 
        ...params, 
        data: { transitTime: 0 } 
      }, eds)
    );
  }, [setEdges]);

  const onNodeChanges = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  const onEdgeChanges = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const onConnectStart = useCallback((event: any, { nodeId }: { nodeId: string }) => {
    if (nodeId) {
      setPendingConnection({ source: nodeId, target: '', sourceHandle: null, targetHandle: null });
    }
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent) => {
    setPendingConnection(null);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setPlaceholderNode(null);

      if (!reactFlowInstance || !reactFlowWrapper.current) {
        return;
      }

      const equipmentData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      
      if (typeof equipmentData.type !== 'string') {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `equipment-${Date.now()}`,
        type: 'equipment',
        position,
        data: { 
          ...equipmentData,
          maxCapacity: equipmentData.maxCapacity || 1 
        },
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
      const jsonData = event.dataTransfer.getData('application/reactflow');
      if (!jsonData) return;
      
      const equipmentData = JSON.parse(jsonData);
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
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
    }
    
  }, [reactFlowInstance, placeholderNode, setNodes]);
  
  const onDragLeave = useCallback(() => {
    if (placeholderNode) {
      setNodes(nds => nds.filter(n => n.id !== 'placeholder'));
      setPlaceholderNode(null);
    }
  }, [placeholderNode, setNodes]);
  
  const findBestNodePosition = useCallback((): XYPosition => {
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
    
    return { x: maxX + 250, y: avgY };
  }, [nodes]);
  
  const handleAddFromConnection = useCallback((equipment: Equipment) => {
    if (!pendingConnection || !pendingConnection.source) return;
    
    const position = findBestNodePosition();
    
    const newNode = {
      id: `equipment-${Date.now()}`,
      type: 'equipment',
      position,
      data: { 
        ...equipment,
        maxCapacity: equipment.maxCapacity || 1  
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
    
    const connection = {
      ...pendingConnection,
      target: newNode.id,
      data: { transitTime: 0 }
    };
    
    setEdges((eds) => addEdge(connection, eds));
    
    toast({
      title: `Added ${equipment.name}`,
      description: `${equipment.name} has been connected to the previous node`,
    });
    
    setPendingConnection(null);
    setShowConnectionAlert(false);
  }, [pendingConnection, findBestNodePosition, setNodes, setEdges]);
  
  const onNodeDragStop = useCallback((event: any, node: Node) => {
    if (!snapToGrid) return;
    
    const newNodes = nodes.map(n => {
      if (n.id === node.id) {
        return {
          ...n,
          position: {
            x: Math.round(n.position.x / 20) * 20,
            y: Math.round(n.position.y / 20) * 20
          }
        };
      }
      return n;
    });
    
    setNodes(newNodes);
  }, [nodes, setNodes, snapToGrid]);
  
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    const nodeIds = nodesToDelete.map(n => n.id);
    
    setEdges(eds => eds.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));
    
    toast({
      title: "Equipment Removed",
      description: "The selected equipment has been removed from the factory floor",
    });
  }, [setEdges]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 pt-2">
        <LiveStatsPanel nodes={nodes} edges={edges} />
      </div>
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodeChanges}
          onEdgesChange={onEdgeChanges}
          onNodesDelete={onNodesDelete}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: 'default'
          }}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          connectionMode={ConnectionMode.Loose}
          attributionPosition="bottom-right"
          className="bg-muted/20"
          snapToGrid={snapToGrid}
          snapGrid={[20, 20]}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background 
            variant={BackgroundVariant.Dots}
            gap={20} 
            size={1} 
            color={showGrid ? 'currentColor' : 'transparent'} 
            className="opacity-30"
          />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              return isSimulating && node.data?.bottleneck ? '#ef4444' : '#1D4ED8';
            }}
          />
        </ReactFlow>
      </div>
      
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
            <AlertDialogCancel onClick={() => setPendingConnection(null)}>Cancel</AlertDialogCancel>
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
