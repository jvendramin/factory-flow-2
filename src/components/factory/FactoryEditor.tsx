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
  useStoreApi,
  NodeDragHandler,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from '@/components/ui/use-toast';
import EquipmentNode from './nodes/EquipmentNode';
import ConfigurableEdge from './edges/ConfigurableEdge';
import { Equipment, FlowEdge, PathStep } from '@/types/equipment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowRightCircle } from 'lucide-react';
import LiveStatsPanel from './LiveStatsPanel';

const MIN_DISTANCE = 60;
const GROUP_THRESHOLD = 30;

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

interface InternalNode {
  id: string;
  position: XYPosition;
  internals?: {
    positionAbsolute?: XYPosition;
  };
}

interface ClosestNodeResult {
  distance: number;
  node: InternalNode | null;
}

const FactoryEditorContent = ({ 
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
  const [potentialGroupTarget, setPotentialGroupTarget] = useState<string | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const activeEdgeRef = useRef<string | null>(null);
  const store = useStoreApi();
  const { getNodes, getEdges, project, screenToFlowPosition } = useReactFlow();
  
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
  
  useEffect(() => {
    const handleEdgeUpdate = (event: CustomEvent) => {
      const { id, data, label } = event.detail;
      
      setEdges(edges => 
        edges.map(e => {
          if (e.id === id) {
            return {
              ...e,
              data,
              label
            };
          }
          return e;
        })
      );
    };
    
    document.addEventListener('edge:update', handleEdgeUpdate as EventListener);
    
    return () => {
      document.removeEventListener('edge:update', handleEdgeUpdate as EventListener);
    };
  }, [setEdges]);
  
  const startPlayByPlaySimulation = useCallback(() => {
    const edgeMap = new Map<string, { targetId: string, transitTime: number }[]>();
    
    edges.forEach(edge => {
      const sources = edgeMap.get(edge.source) || [];
      sources.push({ 
        targetId: edge.target, 
        transitTime: edge.data?.transitTime || 0 
      });
      edgeMap.set(edge.source, sources);
    });
    
    const connectedNodes = new Set<string>();
    const findConnectedNodes = (nodeId: string) => {
      if (connectedNodes.has(nodeId)) return;
      connectedNodes.add(nodeId);
      
      const outgoingEdges = edgeMap.get(nodeId) || [];
      outgoingEdges.forEach(edge => {
        findConnectedNodes(edge.targetId);
      });
    };
    
    const allTargets = new Set(edges.map(e => e.target));
    
    const startNodeIds = nodes.filter(n => 
      !allTargets.has(n.id) && 
      edgeMap.has(n.id) && 
      edgeMap.get(n.id)!.length > 0
    ).map(n => n.id);
    
    if (startNodeIds.length === 0) {
      toast({
        title: "Simulation Error",
        description: "Could not identify the starting point of your process flow. Ensure nodes are connected.",
        variant: "destructive"
      });
      return;
    }
    
    startNodeIds.forEach(nodeId => {
      findConnectedNodes(nodeId);
    });
    
    const activePaths: {
      nodeId: string,
      progress: number,
      inTransit: boolean,
      transitTo: string,
      transitTime: number,
      transitProgress: number
    }[] = startNodeIds.map(id => ({ 
      nodeId: id, 
      progress: 0, 
      inTransit: false,
      transitTo: '', 
      transitTime: 0,
      transitProgress: 0
    }));
    
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
      
      if (activePaths.length === 0) {
        toast({
          title: "Simulation Complete",
          description: "All units have completed the process flow."
        });
        
        const nodeUtilizations = new Map<string, number>();
        const nodeCycles = new Map<string, number>();
        
        let bottleneckId = startNodeIds[0];
        let maxCycleTime = 0;
        
        nodes.forEach(node => {
          if (!connectedNodes.has(node.id)) return;
          
          const nodeData = nodeDataMap.get(node.id);
          if (!nodeData) return;
          
          const cycleTime = nodeData.cycleTime || 0;
          const maxCapacity = nodeData.maxCapacity || 1;
          const adjustedCycleTime = maxCapacity > 1 ? cycleTime / maxCapacity : cycleTime;
          
          if (adjustedCycleTime > maxCycleTime) {
            maxCycleTime = adjustedCycleTime;
            bottleneckId = node.id;
          }
          
          const utilization = Math.min(100, Math.round((adjustedCycleTime / maxCycleTime) * 100));
          nodeUtilizations.set(node.id, utilization);
        });
        
        setNodes(nds => 
          nds.map(node => {
            if (!connectedNodes.has(node.id)) {
              return {
                ...node,
                data: {
                  ...node.data,
                  active: false,
                  utilization: 0,
                  bottleneck: false
                }
              };
            }
            
            return {
              ...node,
              data: {
                ...node.data,
                active: false,
                utilization: nodeUtilizations.get(node.id) || 0,
                bottleneck: node.id === bottleneckId
              }
            };
          })
        );
        
        return;
      }
      
      const nextActivePaths: typeof activePaths = [];
      const activeNodeIds = new Set<string>();
      const transitEdges = new Map<string, number>();
      
      activePaths.forEach(path => {
        if (path.inTransit) {
          path.transitProgress += delta * simulationSpeed / path.transitTime;
          
          if (path.transitTime > 0) {
            const edgeId = edges.find(
              e => e.source === path.nodeId && e.target === path.transitTo
            )?.id;
            
            if (edgeId) {
              transitEdges.set(edgeId, path.transitProgress);
            }
          }
          
          if (path.transitProgress >= 1 || path.transitTime <= 0) {
            nextActivePaths.push({
              nodeId: path.transitTo,
              progress: 0,
              inTransit: false,
              transitTo: '',
              transitTime: 0,
              transitProgress: 0
            });
            
            activeNodeIds.add(path.transitTo);
          } else {
            nextActivePaths.push({...path});
          }
        } else {
          const nodeData = nodeDataMap.get(path.nodeId);
          if (!nodeData) return;
          
          activeNodeIds.add(path.nodeId);
          
          const cycleDuration = nodeData.cycleTime || 0;
          const maxCapacity = nodeData.maxCapacity || 1;
          const adjustedCycleDuration = cycleDuration / maxCapacity;
          
          path.progress += delta * simulationSpeed / adjustedCycleDuration;
          
          if (path.progress >= 1) {
            const nextNodes = edgeMap.get(path.nodeId) || [];
            
            if (nextNodes.length === 0) {
            } else {
              nextNodes.forEach(({ targetId, transitTime }) => {
                nextActivePaths.push({
                  nodeId: path.nodeId,
                  progress: 1,
                  inTransit: true,
                  transitTo: targetId,
                  transitTime: transitTime,
                  transitProgress: 0
                });
              });
            }
          } else {
            nextActivePaths.push({...path});
          }
        }
      });
      
      activePaths.length = 0;
      activePaths.push(...nextActivePaths);
      
      setNodes(nds => 
        nds.map(node => ({
          ...node,
          data: {
            ...node.data,
            active: activeNodeIds.has(node.id),
            progress: nextActivePaths.find(p => p.nodeId === node.id && !p.inTransit)?.progress
          }
        }))
      );
      
      setEdges(eds => 
        eds.map(e => ({
          ...e,
          data: {
            ...e.data,
            transitInProgress: transitEdges.has(e.id),
            transitProgress: transitEdges.get(e.id) || 0
          }
        }))
      );
      
      const primaryPath = nextActivePaths[0];
      if (primaryPath && !primaryPath.inTransit) {
        setCurrentUnitPosition({ 
          nodeId: primaryPath.nodeId, 
          progress: primaryPath.progress 
        });
        
        if (onUnitPositionUpdate) {
          onUnitPositionUpdate({ 
            nodeId: primaryPath.nodeId, 
            progress: primaryPath.progress 
          });
        }
      } else if (onUnitPositionUpdate) {
        onUnitPositionUpdate(null);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [edges, nodes, setNodes, simulationSpeed, onUnitPositionUpdate, setEdges]);
  
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);
  
  const onConnect = useCallback((params: Connection) => {
    console.log("Connection params:", params);
    
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
  
  const getClosestNode = useCallback((node: Node): { id: string; source: string; target: string; className?: string } | null => {
    const storeState = store.getState();
    const flowNodes = getNodes();
    
    const currentNode = flowNodes.find(n => n.id === node.id);
    
    if (!currentNode || !currentNode.position) {
      return null;
    }

    const currentPosition = {
      x: currentNode.position.x,
      y: currentNode.position.y,
    };
    
    let closestDistance = Number.MAX_VALUE;
    let closestNode: Node | null = null;
    
    flowNodes.forEach(n => {
      if (n.id !== node.id && !n.parentId) {
        const dx = n.position.x - currentPosition.x;
        const dy = n.position.y - currentPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < closestDistance && distance < MIN_DISTANCE) {
          closestDistance = distance;
          closestNode = n;
        }
      }
    });
    
    if (!closestNode) {
      return null;
    }
    
    const closeNodeIsSource = closestNode.position.x < currentPosition.x;
    
    return {
      id: closeNodeIsSource
        ? `${closestNode.id}-${node.id}`
        : `${node.id}-${closestNode.id}`,
      source: closeNodeIsSource ? closestNode.id : node.id,
      target: closeNodeIsSource ? node.id : closestNode.id,
    };
  }, [store, getNodes]);
  
  const isNodeOverlapping = useCallback((draggingNode: Node): string | null => {
    if (draggingNode.parentId) return null; // Don't check nodes already in a group
    
    const flowNodes = getNodes();
    const currentNode = flowNodes.find(n => n.id === draggingNode.id);
    
    if (!currentNode || !currentNode.position) {
      return null;
    }

    const nodeWidth = 240; 
    const nodeHeight = 180;
    
    const currentX = currentNode.position.x;
    const currentY = currentNode.position.y;
    
    for (const node of flowNodes) {
      if (node.id !== draggingNode.id && !node.parentId && node.type !== 'group') {
        const targetX = node.position.x;
        const targetY = node.position.y;
        
        const distance = Math.sqrt(
          Math.pow(targetX - currentX, 2) + 
          Math.pow(targetY - currentY, 2)
        );
        
        if (distance < GROUP_THRESHOLD) {
          return node.id;
        }
      }
    }
    
    return null;
  }, [getNodes]);
  
  const onNodeDrag: NodeDragHandler = useCallback((_, node) => {
    if (isSimulating) return;
    
    const closeEdge = getClosestNode(node);
    
    setEdges((es) => {
      const nextEdges = es.filter((e) => e.className !== 'temp');
      
      if (closeEdge && !nextEdges.find(
        (ne) => ne.source === closeEdge.source && ne.target === closeEdge.target
      )) {
        closeEdge.className = 'temp';
        nextEdges.push({
          ...closeEdge,
          type: 'default',
          style: { strokeDasharray: '5,5' },
          data: { transitTime: 0 }
        });
      }
      
      return nextEdges;
    });
    
    const overlappingNodeId = isNodeOverlapping(node);
    setPotentialGroupTarget(overlappingNodeId);
    
    if (overlappingNodeId) {
      setNodes(nodes => 
        nodes.map(n => {
          if (n.id === overlappingNodeId) {
            return {
              ...n,
              className: 'potential-group-target'
            };
          }
          return {
            ...n,
            className: n.className?.replace('potential-group-target', '') || ''
          };
        })
      );
    } else {
      setNodes(nodes => 
        nodes.map(n => ({
          ...n,
          className: n.className?.replace('potential-group-target', '') || ''
        }))
      );
    }
  }, [getClosestNode, setEdges, isSimulating, isNodeOverlapping, setNodes]);
  
  const createGroup = useCallback((nodeId: string, targetId: string) => {
    const nodeA = nodes.find(n => n.id === nodeId);
    const nodeB = nodes.find(n => n.id === targetId);
    
    if (!nodeA || !nodeB) return;
    
    const groupId = `group-${Date.now()}`;
    
    const left = Math.min(nodeA.position.x, nodeB.position.x) - 40;
    const top = Math.min(nodeA.position.y, nodeB.position.y) - 40;
    const right = Math.max(nodeA.position.x + 240, nodeB.position.x + 240) + 40;
    const bottom = Math.max(nodeA.position.y + 180, nodeB.position.y + 180) + 40;
    
    const width = right - left;
    const height = bottom - top;
    
    const groupNode: Node = {
      id: groupId,
      type: 'group',
      position: { x: left, y: top },
      style: { width, height },
      data: { label: 'Equipment Group' },
    };
    
    const updatedNodes = nodes.map(n => {
      if (n.id === nodeId || n.id === targetId) {
        return {
          ...n,
          position: {
            x: n.position.x - left,
            y: n.position.y - top
          },
          parentId: groupId,
          extent: 'parent' as const,
          className: ''
        };
      }
      return n;
    });
    
    setNodes([...updatedNodes, groupNode]);
    
    toast({
      title: "Group Created",
      description: "Equipment has been grouped together",
    });
  }, [nodes, setNodes]);
  
  const onNodeDragStop: NodeDragHandler = useCallback((_, node) => {
    if (isSimulating) return;
    
    const closeEdge = getClosestNode(node);
    
    setEdges((es) => {
      const nextEdges = es.filter((e) => e.className !== 'temp');
      
      if (closeEdge && !nextEdges.find(
        (ne) => ne.source === closeEdge.source && ne.target === closeEdge.target
      )) {
        toast({
          title: "Connection created",
          description: "Nodes connected automatically due to proximity",
        });
        
        nextEdges.push({
          ...closeEdge,
          type: 'default',
          data: { transitTime: 0 }
        });
      }
      
      return nextEdges;
    });
    
    if (potentialGroupTarget) {
      createGroup(node.id, potentialGroupTarget);
      setPotentialGroupTarget(null);
    }
    
    setNodes(nodes => 
      nodes.map(n => ({
        ...n,
        className: n.className?.replace('potential-group-target', '') || ''
      }))
    );
  }, [getClosestNode, setEdges, isSimulating, potentialGroupTarget, createGroup, setNodes]);

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
      const position = reactFlowInstance.screenToFlowPosition({
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
      const position = reactFlowInstance.screenToFlowPosition({
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
  
  const onNodeDragStopGrid = useCallback((event: any, node: Node) => {
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
          onNodeDragStop={onNodeDragStopGrid}
          onNodeDrag={onNodeDrag}
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

const FactoryEditor = (props: FactoryEditorProps) => {
  return (
    <ReactFlowProvider>
      <FactoryEditorContent {...props} />
    </ReactFlowProvider>
  );
};

export default FactoryEditor;
