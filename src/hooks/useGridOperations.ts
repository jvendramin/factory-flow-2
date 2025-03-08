
import { useCallback } from 'react';
import { Node } from 'reactflow';

export const useGridOperations = (snapToGrid: boolean, setNodes: any) => {
  // Find best position for new nodes
  const findBestNodePosition = useCallback((nodes: Node[]) => {
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
  }, []);
  
  // Snap nodes to grid on drag stop
  const onNodeDragStopGrid = useCallback((event: any, node: Node, nodes: Node[]) => {
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
  }, [snapToGrid, setNodes]);

  return {
    findBestNodePosition,
    onNodeDragStopGrid
  };
};
