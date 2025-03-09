
import { useCallback, useRef, useState, useEffect } from 'react';
import { Edge, Node, useReactFlow } from 'reactflow';
import { toast } from '@/components/ui/use-toast';

export interface SimulationHookProps {
  isSimulating: boolean;
  simulationMode?: "instant" | "play-by-play";
  simulationSpeed?: number;
  onUnitPositionUpdate?: (position: { nodeId: string, progress: number } | null) => void;
}

export const useFactorySimulation = ({
  isSimulating,
  simulationMode = "instant",
  simulationSpeed = 1,
  onUnitPositionUpdate
}: SimulationHookProps) => {
  const [currentUnitPosition, setCurrentUnitPosition] = useState<{ nodeId: string, progress: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Start or stop simulation based on props
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
    const nodes = getNodes();
    const edges = getEdges();
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
          // Calculate progress increment based on transit time and ensure minimum value to prevent division by zero
          const transitTimeSeconds = Math.max(path.transitTime, 0.1);
          
          // Update progress based on simulation speed and delta time
          path.transitProgress += (delta * simulationSpeed) / transitTimeSeconds;
          
          if (path.transitTime > 0) {
            // Find edge between current node and target node
            const edgeId = edges.find(
              e => e.source === path.nodeId && e.target === path.transitTo
            )?.id;
            
            if (edgeId) {
              // Store the transit progress for this edge
              transitEdges.set(edgeId, path.transitProgress);
            }
          }
          
          // Check if transit is complete
          if (path.transitProgress >= 1) {
            // Transit complete, move to the next node
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
            // Continue transit
            nextActivePaths.push({...path});
          }
        } else {
          const nodeData = nodeDataMap.get(path.nodeId);
          if (!nodeData) return;
          
          activeNodeIds.add(path.nodeId);
          
          // Normal node processing
          let cycleDuration = nodeData.cycleTime || 0;
          let maxCapacity = nodeData.maxCapacity || 1;
          const adjustedCycleDuration = cycleDuration / maxCapacity;
          
          path.progress += delta * simulationSpeed / adjustedCycleDuration;
          
          if (path.progress >= 1) {
            const nextNodes = edgeMap.get(path.nodeId) || [];
            
            if (nextNodes.length === 0) {
              // End of the flow
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
      
      // Update edges with transit animation data
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
  }, [getNodes, getEdges, setNodes, simulationSpeed, onUnitPositionUpdate, setEdges]);

  return {
    currentUnitPosition,
    startPlayByPlaySimulation
  };
};
