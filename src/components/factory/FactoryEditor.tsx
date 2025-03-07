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
import GroupNode from './nodes/GroupNode';
import ConfigurableEdge from './edges/ConfigurableEdge';
import { Equipment, FlowEdge, PathStep } from '@/types/equipment';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowRightCircle, FolderPlus } from 'lucide-react';
import LiveStatsPanel from './LiveStatsPanel';
import { Button } from '@/components/ui/button';

const MIN_DISTANCE = 60;
const GROUP_THRESHOLD = 30;
const NODE_WIDTH = 240;
const NODE_HEIGHT = 180;
const GROUP_PADDING = 10;
const NODE_VERTICAL_SPACING = 20;
const OVERLAP_THRESHOLD = 0.3; // 30% overlap threshold

const nodeTypes: NodeTypes = {
  equipment: EquipmentNode,
  group: GroupNode,
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
    const groupChildrenMap = new Map<string, string[]>();
    
    nodes.forEach(node => {
      if (node.parentId) {
        const children = groupChildrenMap.get(node.parentId) || [];
        children.push(node.id);
        groupChildrenMap.set(node.parentId, children);
      }
    });
    
    const findConnectedNodes = (nodeId: string) => {
      if (connectedNodes.has(nodeId)) return;
      connectedNodes.add(nodeId);
      
      if (groupChildrenMap.has(nodeId)) {
        groupChildrenMap.get(nodeId)?.forEach(childId => {
          connectedNodes.add(childId);
        });
      }
      
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
      transitProgress: number,
      isGroup?: boolean,
      groupChildren?: string[]
    }[] = startNodeIds.map(id => ({ 
      nodeId: id, 
      progress: 0, 
      inTransit: false,
      transitTo: '', 
      transitTime: 0,
      transitProgress: 0,
      isGroup: nodes.find(n => n.id === id)?.type === 'group',
      groupChildren: groupChildrenMap.get(id)
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
          
          if (path.isGroup && path.groupChildren) {
            path.groupChildren.forEach(childId => {
              activeNodeIds.add(childId);
            });
          }
          
          let cycleDuration = nodeData.cycleTime || 0;
          let maxCapacity = nodeData.maxCapacity || 1;
          
          if (path.isGroup && path.groupChildren) {
            let maxChildCycleTime = 0;
            path.groupChildren.forEach(childId => {
              const childData = nodeDataMap.get(childId);
              if (childData) {
                const childCycleTime = (childData.cycleTime || 0) / (childData.maxCapacity || 1);
                maxChildCycleTime = Math.max(maxChildCycleTime, childCycleTime);
              }
            });
            
            cycleDuration = maxChildCycleTime;
          }
          
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
                  transitProgress: 0,
                  isGroup: nodes.find(n => n.id === targetId)?.type === 'group',
                  groupChildren: groupChildrenMap.get(targetId)
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
  
  const calculateOverlap = useCallback((nodeA: Node, nodeB: Node): number => {
    const aLeft = nodeA.position.x;
    const aRight = aLeft + NODE_WIDTH;
    const aTop = nodeA.position.y;
    const aBottom = aTop + NODE_HEIGHT;
    
    const bLeft = nodeB.position.x;
    const bRight = bLeft + NODE_WIDTH;
    const bTop = nodeB.position.y;
    const bBottom = bTop + NODE_HEIGHT;
    
    const overlapLeft = Math.max(aLeft, bLeft);
    const overlapRight = Math.min(aRight, bRight);
    const overlapTop = Math.max(aTop, bTop);
    const overlapBottom = Math.min(aBottom, bBottom);
    
    if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
      const nodeArea = NODE_WIDTH * NODE_HEIGHT;
      
      return overlapArea / nodeArea;
    }
    
    return 0;
  }, []);
  
  const findOverlappingNodes = useCallback((node: Node): Node[] => {
    const flowNodes = getNodes();
    const overlappingNodes: Node[] = [];
    
    flowNodes.forEach(n => {
      if (n.id !== node.id && !n.parentId && n.type !== 'group') {
        const overlapPercentage = calculateOverlap(node, n);
        
        if (overlapPercentage > OVERLAP_THRESHOLD) {
          overlappingNodes.push(n);
        }
      }
    });
    
    return overlappingNodes;
  }, [getNodes, calculateOverlap]);
  
  const createGroupFromNodes = useCallback((nodeIds: string[]) => {
    if (nodeIds.length < 2) return;
    
    const groupId = `group-${Date.now()}`;
    const allNodes = getNodes();
    const nodesToGroup = allNodes.filter(n => nodeIds.includes(n.id));
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    nodesToGroup.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + NODE_WIDTH);
      maxY = Math.max(maxY, node.position.y + NODE_HEIGHT);
    });
    
    minX -= GROUP_PADDING;
    minY -= GROUP_PADDING;
    maxX += GROUP_PADDING;
    maxY += GROUP_PADDING;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    const nodesToUpdate = [...nodesToGroup];
    const verticalSpace = (height - (nodesToGroup.length * NODE_HEIGHT)) / 
                          Math.max(1, nodesToGroup.length - 1);
    const spacing = Math.max(NODE_VERTICAL_SPACING, verticalSpace);
    
    nodesToUpdate.sort((a, b) => a.position.y - b.position.y);
    
    const updatedNodes = allNodes.map(n => {
      if (nodeIds.includes(n.id)) {
        const index = nodesToUpdate.findIndex(node => node.id === n.id);
        return {
          ...n,
          position: {
            x: GROUP_PADDING,
            y: GROUP_PADDING + (index * (NODE_HEIGHT + spacing))
          },
          parentId: groupId,
          extent: 'parent' as const,
          className: ''
        };
      }
      return n;
    });
    
    const groupHeight = GROUP_PADDING * 2 + (nodesToUpdate.length * NODE_HEIGHT) + 
                        ((nodesToUpdate.length - 1) * spacing);
    
    const groupNode: Node = {
      id: groupId,
      type: 'group',
      position: { x: minX, y: minY },
      style: { 
        width: width, 
        height: groupHeight
      },
      data: { 
        label: 'Equipment Group',
        nodes: nodeIds
      },
    };
    
    setNodes([...updatedNodes, groupNode]);
    
    toast({
      title: "Group Created",
      description: `${nodeIds.length} equipment items have been grouped together`,
    });
  }, [getNodes, setNodes]);
  
  const checkGroupMembership = useCallback((node: Node) => {
    if (!node.parentId) return;
    
    const parentNode = getNodes().find(n => n.id === node.parentId);
    if (!parentNode) return;
    
    const parentWidth = parentNode.style?.width as number || 0;
    const parentHeight = parentNode.style?.height as number || 0;
    
    if (node.position.x < -NODE_WIDTH/3 || 
        node.position.y < -NODE_HEIGHT/3 || 
        node.position.x > parentWidth - NODE_WIDTH*2/3 || 
        node.position.y > parentHeight - NODE_HEIGHT*2/3) {
      
      setNodes(nodes => {
        const parentPos = parentNode.position;
        const absolutePos = {
          x: parentPos.x + node.position.x,
          y: parentPos.y + node.position.y
        };
        
        const updatedNodes = nodes.map(n => {
          if (n.id === node.id) {
            return {
              ...n,
              parentId: undefined,
              extent: undefined,
              position: absolutePos
            };
          }
          return n;
        });
        
        const remainingGroupNodes = updatedNodes.filter(n => n.parentId === parentNode.id);
        
        if (remainingGroupNodes.length <= 1) {
          const nodesWithoutGroup = updatedNodes.map(n => {
            if (n.parentId === parentNode.id) {
              return {
                ...n,
                parentId: undefined,
                extent: undefined,
                position: {
                  x: parentPos.x + n.position.x,
                  y: parentPos.y + n.position.y
                }
              };
            }
            return n;
          });
          
          return nodesWithoutGroup.filter(n => n.id !== parentNode.id);
        } else {
          let newHeight = GROUP_PADDING * 2;
          
          remainingGroupNodes.sort((a, b) => a.position.y - b.position.y);
          
          const updateWithNewPositions = updatedNodes.map((n, idx) => {
            if (n.parentId === parentNode.id) {
              const groupIndex = remainingGroupNodes.findIndex(gn => gn.id === n.id);
              return {
                ...n,
                position: {
                  x: GROUP_PADDING,
                  y: GROUP_PADDING + (groupIndex * (NODE_HEIGHT + NODE_VERTICAL_SPACING))
                }
              };
            }
            return n;
          });
          
          newHeight += (remainingGroupNodes.length * NODE_HEIGHT) + 
                        ((remainingGroupNodes.length - 1) * NODE_VERTICAL_SPACING);
          
          return updateWithNewPositions.map(n => {
            if (n.id === parentNode.id) {
              return {
                ...n,
                style: {
                  ...n.style,
                  height: newHeight
                },
                data: {
                  ...n.data,
                  nodes: remainingGroupNodes.map(gn => gn.id)
                }
              };
            }
            return n;
          });
        }
      });
      
      toast({
        title: "Node Removed from Group",
        description: "The equipment has been removed from its group"
      });
    }
  }, [getNodes, setNodes]);
  
  const isNodeInGroup = useCallback((nodeId: string): boolean => {
    return getNodes().some(n => n.parentId && n.id === nodeId);
  }, [getNodes]);
  
  const createEmptyGroup = useCallback(() => {
    if (!reactFlowInstance || !reactFlowWrapper.current) {
      return;
    }
    
    const { x, y, zoom } = reactFlowInstance.getViewport();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    
    const position = reactFlowInstance.screenToFlowPosition({
      x: reactFlowBounds.width / 2,
      y: reactFlowBounds.height / 2,
    });
    
    const defaultWidth = 400;
    const defaultHeight = 300;
    
    const groupNode: Node = {
      id: `group-${Date.now()}`,
      type: 'group',
      position,
      style: { 
        width: defaultWidth, 
        height: defaultHeight
      },
      data: { 
        label: 'New Group',
        nodes: []
      },
    };
    
    setNodes(nds => [...nds, groupNode]);
    
    toast({
      title: "Group Created",
      description: "Empty group created. Drag nodes inside to group them."
    });
  }, [reactFlowInstance, setNodes]);
  
  const checkNodeOverGroup = useCallback((node: Node, dragEvent: React.MouseEvent | MouseEvent) => {
    const groups = getNodes().filter(n => n.type === 'group' && n.id !== node.id);
    
    if (groups.length === 0 || node.type === 'group') return;
    
    const nodeCenter = {
      x: node.position.x + (NODE_WIDTH / 2),
      y: node.position.y + (NODE_HEIGHT / 2)
    };
    
    let targetGroup: Node | null = null;
    
    groups.forEach(group => {
      if (
        nodeCenter.x > group.position.x && 
        nodeCenter.x < group.position.x + (group.style?.width as number || 0) &&
        nodeCenter.y > group.position.y && 
        nodeCenter.y < group.position.y + (group.style?.height as number || 0)
      ) {
        targetGroup = group;
      }
    });
    
    if (targetGroup && !node.parentId) {
      setPotentialGroupTarget(targetGroup.id);
    } else {
      setPotentialGroupTarget(null);
    }
    
    return targetGroup;
  }, [getNodes]);
  
  const onNodeDrag: NodeDragHandler = useCallback((event, node) => {
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
    
    if (node.parentId) {
      checkGroupMembership(node);
    } else {
      const targetGroup = checkNodeOverGroup(node, event);
      
      if (!targetGroup) {
        const overlappingNodes = findOverlappingNodes(node);
        
        if (overlappingNodes.length > 0) {
          setNodes(nodes => 
            nodes.map(n => {
              if (overlappingNodes.some(on => on.id === n.id) || n.id === node.id) {
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
      }
    }
  }, [getClosestNode, setEdges, isSimulating, findOverlappingNodes, setNodes, checkGroupMembership, checkNodeOverGroup]);
  
  const onNodeDragStop: NodeDragHandler = useCallback((event, node) => {
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
    
    const targetGroup = checkNodeOverGroup(node, event);
    
    if (targetGroup) {
      setNodes(nodes => {
        return nodes.map(n => {
          if (n.id === node.id) {
            return {
              ...n,
              position: {
                x: GROUP_PADDING,
                y: GROUP_PADDING
              },
              parentId: targetGroup.id,
              extent: 'parent' as const,
              className: ''
            };
          } else if (n.id === targetGroup.id) {
            return {
              ...n,
              data: {
                ...n.data,
                nodes: [...(n.data.nodes || []), node.id]
              }
            };
          }
          return n;
        });
      });
      
      toast({
        title: "Node Added to Group",
        description: "Node has been added to the group"
      });
    } else if (!node.parentId) {
      const overlappingNodes = findOverlappingNodes(node);
      
      if (overlappingNodes.length > 0) {
        const nodeIds = [node.id, ...overlappingNodes.map(n => n.id)];
        createGroupFromNodes(nodeIds);
      }
    }
    
    setNodes(nodes => 
      nodes.map(n => ({
        ...n,
        className: n.className?.replace('potential-group-target', '') || ''
      }))
    );
    
    setPotentialGroupTarget(null);
  }, [getClosestNode, setEdges, isSimulating, findOverlappingNodes, createGroupFromNodes, setNodes, checkNodeOverGroup]);
  
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
  
  const findBestNodePosition = useCallback(() => {
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
      <div className="px-4 pt-2 flex justify-between items-center">
        <LiveStatsPanel nodes={nodes} edges={edges} />
        <div className="flex gap-2 pr-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={createEmptyGroup} 
            className="gap-1 bg-transparent"
            disabled={isSimulating}
          >
            <FolderPlus size={16} />
            Create Group
          </Button>
        </div>
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
              if (isSimulating && node.data?.bottleneck) return '#ef4444';
              if (node.type === 'group') return '#94a3b8';
              return '#1D4ED8';
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

