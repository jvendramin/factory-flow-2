
import { useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { toast } from '@/components/ui/use-toast';
import { ActivePath } from '@/types/simulation';
import { buildFactoryGraph, calculateSystemStats } from '@/utils/simulationUtils';

/**
 * Handles the animation loop for the play-by-play simulation
 */
export const useAnimationLoop = (
  isSimulating: boolean,
  simulationSpeed: number,
  onUnitPositionUpdate?: (position: { nodeId: string, progress: number } | null) => void
) => {
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestamp = useRef<number>(0);
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  
  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);
  
  // Stop animation and reset states
  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      
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
  }, [onUnitPositionUpdate, setNodes, setEdges]);
  
  // Main animation loop for play-by-play simulation
  const startPlayByPlayAnimation = useCallback(() => {
    const nodes = getNodes();
    const edges = getEdges();
    
    // Build graph representation for simulation
    const { edgeMap, connectedNodes, startNodeIds } = buildFactoryGraph(nodes, edges);
    
    // If no valid start nodes were found, abort simulation
    if (startNodeIds.length === 0) {
      toast({
        title: "Simulation Error",
        description: "Could not identify a valid starting point. Ensure you have at least one node with no incoming connections.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a map of node data for quick lookup
    const nodeDataMap = new Map(nodes.map(n => [n.id, n.data]));
    
    // Initialize active paths from starting nodes
    const activePaths: ActivePath[] = startNodeIds.map(id => ({ 
      nodeId: id, 
      progress: 0, 
      inTransit: false,
      transitTo: '', 
      transitTime: 0,
      transitProgress: 0
    }));
    
    // Reset timestamp for animation
    lastTimestamp.current = 0;
    
    // Main animation frame function
    const animate = (timestamp: number) => {
      // Initialize timestamp on first frame
      if (lastTimestamp.current === 0) {
        lastTimestamp.current = timestamp;
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Calculate time delta in seconds with smoothing
      const delta = Math.min((timestamp - lastTimestamp.current) / 1000, 0.1); // Cap max delta to prevent jumps
      lastTimestamp.current = timestamp;
      
      // If all units have completed the process flow
      if (activePaths.length === 0) {
        toast({
          title: "Simulation Complete",
          description: "All units have completed the process flow."
        });
        
        // Calculate final stats and update node displays
        const { bottleneckId, nodeUtilizations } = calculateSystemStats(nodes, connectedNodes);
        
        setNodes(nds => 
          nds.map(node => ({
            ...node,
            data: {
              ...node.data,
              active: false,
              utilization: nodeUtilizations.get(node.id) || 0,
              bottleneck: node.id === bottleneckId
            }
          }))
        );
        
        return;
      }
      
      const nextActivePaths: ActivePath[] = [];
      const activeNodeIds = new Set<string>();
      const transitEdges = new Map<string, number>();
      
      // Process each active path
      activePaths.forEach(path => {
        if (path.inTransit) {
          // Calculate progress increment based on transit time and ensure minimum value to prevent division by zero
          const transitTimeSeconds = Math.max(path.transitTime, 0.1);
          
          // Update progress based on simulation speed and delta time - ensure smooth progression
          const progressIncrement = (delta * simulationSpeed) / transitTimeSeconds;
          path.transitProgress = Math.min(1, path.transitProgress + progressIncrement);
          
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
          
          // Ensure we don't divide by zero
          const adjustedCycleDuration = Math.max(cycleDuration / maxCapacity, 0.1);
          
          // Calculate progress increment with smoothing
          const progressIncrement = delta * simulationSpeed / adjustedCycleDuration;
          path.progress = Math.min(1, path.progress + progressIncrement);
          
          if (path.progress >= 1) {
            const nextNodes = edgeMap.get(path.nodeId) || [];
            
            if (nextNodes.length === 0) {
              // End of the flow, unit is complete
              toast({
                title: "Unit Complete",
                description: `A unit has completed processing at ${nodeData.name || path.nodeId}`,
                variant: "default"
              });
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
      
      // Update active paths for next frame
      activePaths.length = 0;
      activePaths.push(...nextActivePaths);
      
      // Update nodes with active state and progress
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
      
      // Update unit position for external tracking
      const primaryPath = nextActivePaths[0];
      if (primaryPath && !primaryPath.inTransit && onUnitPositionUpdate) {
        onUnitPositionUpdate({ 
          nodeId: primaryPath.nodeId, 
          progress: primaryPath.progress 
        });
      } else if (onUnitPositionUpdate) {
        onUnitPositionUpdate(null);
      }
      
      // Request next animation frame if simulation is still running
      if (isSimulating) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [getNodes, getEdges, setNodes, setEdges, simulationSpeed, onUnitPositionUpdate, isSimulating]);
  
  return {
    startPlayByPlayAnimation,
    stopAnimation
  };
};
