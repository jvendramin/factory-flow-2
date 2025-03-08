
import { useCallback, useState } from 'react';
import { Connection, Edge, Node, addEdge } from 'reactflow';
import { toast } from '@/components/ui/use-toast';
import { Equipment } from '@/types/equipment';

export const useNodeOperations = (setNodes: any, setEdges: any) => {
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [showConnectionAlert, setShowConnectionAlert] = useState(false);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds: Edge[]) => 
      addEdge({ 
        ...params, 
        data: { transitTime: 0 } 
      }, eds)
    );
  }, [setEdges]);

  const onConnectStart = useCallback((event: any, { nodeId }: { nodeId: string }) => {
    if (nodeId) {
      setPendingConnection({ source: nodeId, target: '', sourceHandle: null, targetHandle: null });
    }
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent) => {
    setPendingConnection(null);
  }, []);

  // Handle adding nodes from connection
  const handleAddFromConnection = useCallback((equipment: Equipment, nodes: Node[]) => {
    if (!pendingConnection || !pendingConnection.source) return;
    
    // Find best position calculations moved to useGridOperations
    let maxX = 0;
    let avgY = 0;
    
    if (nodes.length === 0) {
      maxX = 100;
      avgY = 200;
    } else {
      nodes.forEach(node => {
        if (node.position.x > maxX) {
          maxX = node.position.x;
        }
        avgY += node.position.y;
      });
      avgY = avgY / nodes.length;
    }
    
    const position = { x: maxX + 250, y: avgY };
    
    const newNode = {
      id: `equipment-${Date.now()}`,
      type: 'equipment',
      position,
      data: { 
        ...equipment,
        maxCapacity: equipment.maxCapacity || 1  
      },
    };
    
    setNodes((nds: Node[]) => nds.concat(newNode));
    
    const connection = {
      ...pendingConnection,
      target: newNode.id,
      data: { transitTime: 0 }
    };
    
    setEdges((eds: Edge[]) => addEdge(connection, eds));
    
    toast({
      title: `Added ${equipment.name}`,
      description: `${equipment.name} has been connected to the previous node`,
    });
    
    setPendingConnection(null);
    setShowConnectionAlert(false);
  }, [pendingConnection, setNodes, setEdges]);

  // Handle node deletion
  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    const nodeIds = nodesToDelete.map(n => n.id);
    
    // For any groups being deleted, release their children first
    const groupsToDelete = nodesToDelete.filter(n => n.type === 'group');
    
    if (groupsToDelete.length > 0) {
      setNodes((nodes: Node[]) => {
        let updatedNodes = [...nodes];
        
        // First, adjust positions for all children of deleted groups
        groupsToDelete.forEach(group => {
          updatedNodes = updatedNodes.map(node => {
            if (node.parentNode === group.id) {
              return {
                ...node,
                position: {
                  x: group.position.x + node.position.x,
                  y: group.position.y + node.position.y,
                },
                parentNode: undefined,
                extent: undefined
              };
            }
            return node;
          });
        });
        
        // Then filter out the deleted nodes
        return updatedNodes.filter(n => !nodeIds.includes(n.id));
      });
    } else {
      // Regular deletion for non-group nodes
      setNodes((nodes: Node[]) => nodes.filter(n => !nodeIds.includes(n.id)));
    }
    
    // Remove associated edges
    setEdges((eds: Edge[]) => eds.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));
    
    toast({
      title: "Equipment Removed",
      description: "The selected equipment has been removed from the factory floor",
    });
  }, [setNodes, setEdges]);

  return {
    pendingConnection,
    setPendingConnection,
    showConnectionAlert,
    setShowConnectionAlert,
    onConnect,
    onConnectStart,
    onConnectEnd,
    handleAddFromConnection,
    onNodesDelete
  };
};
