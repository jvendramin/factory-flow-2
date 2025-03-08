
import { useCallback } from 'react';
import { Node, useReactFlow, NodeDragHandler } from 'reactflow';
import { toast } from '@/components/ui/use-toast';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 180;

export const useGroupingOperations = (isSimulating: boolean) => {
  const { getNodes, setNodes } = useReactFlow();

  // Helper function to check if a node is over a group
  const isNodeOverGroup = useCallback((node: Node, groups: Node[]) => {
    if (!node || !groups.length) return null;
    
    // Center point of the node
    const nodeCenter = {
      x: node.position.x + (NODE_WIDTH / 2),
      y: node.position.y + (NODE_HEIGHT / 2)
    };
    
    // Find the first group the node is over
    for (const group of groups) {
      const width = group.style?.width as number || 300;
      const height = group.style?.height as number || 200;
      
      if (
        nodeCenter.x > group.position.x && 
        nodeCenter.x < group.position.x + width &&
        nodeCenter.y > group.position.y && 
        nodeCenter.y < group.position.y + height
      ) {
        return group;
      }
    }
    
    return null;
  }, []);
  
  // Create an empty group
  const createEmptyGroup = useCallback((reactFlowInstance: any, reactFlowWrapper: React.RefObject<HTMLDivElement>) => {
    if (!reactFlowInstance || !reactFlowWrapper.current) {
      return;
    }
    
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
        label: 'Sub-Flow',
        nodes: []
      },
    };
    
    setNodes(nds => [...nds, groupNode]);
    
    toast({
      title: "Sub-Flow Created",
      description: "Empty sub-flow created. Drag nodes inside to group them."
    });
  }, [setNodes]);
  
  // Handle node drag events to highlight potential group drops
  const onNodeDrag: NodeDragHandler = useCallback((event, node) => {
    if (isSimulating) return;
    
    // Only process nodes that aren't already in a group
    if (!node.parentNode) {
      const groups = getNodes().filter(n => n.type === 'group' && n.id !== node.id);
      const targetGroup = isNodeOverGroup(node, groups);
      
      // Highlight potential drop targets
      setNodes(nodes => 
        nodes.map(n => {
          if (targetGroup && n.id === targetGroup.id) {
            return {
              ...n,
              className: 'group-drop-target'
            };
          }
          
          // Remove highlight from other groups
          if (n.type === 'group' && n.className?.includes('group-drop-target')) {
            return {
              ...n,
              className: n.className.replace('group-drop-target', '').trim()
            };
          }
          
          return n;
        })
      );
    }
  }, [isSimulating, isNodeOverGroup, getNodes, setNodes]);
  
  // Handle node drag end to finalize group assignment
  const onNodeDragStop: NodeDragHandler = useCallback((event, node) => {
    if (isSimulating) return;
    
    // Only process nodes that aren't already in a group
    if (!node.parentNode) {
      const groups = getNodes().filter(n => n.type === 'group' && n.id !== node.id);
      const targetGroup = isNodeOverGroup(node, groups);
      
      if (targetGroup) {
        // Calculate position relative to group
        const relativePosition = {
          x: node.position.x - targetGroup.position.x,
          y: node.position.y - targetGroup.position.y
        };
        
        // Update node to be child of group
        setNodes(nodes => {
          return nodes.map(n => {
            if (n.id === node.id) {
              return {
                ...n,
                position: relativePosition,
                parentNode: targetGroup.id,
                extent: 'parent' as const,
                className: ''
              };
            } else if (n.id === targetGroup.id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  nodes: [...(n.data.nodes || []), node.id]
                },
                className: (n.className || '').replace('group-drop-target', '').trim()
              };
            }
            return {
              ...n,
              className: (n.className || '').replace('group-drop-target', '').trim()
            };
          });
        });
        
        toast({
          title: "Node Added to Sub-Flow",
          description: "Node has been added to the sub-flow"
        });
      } else {
        // Clear any highlight classes
        setNodes(nodes => 
          nodes.map(n => ({
            ...n,
            className: (n.className || '').replace('group-drop-target', '').trim()
          }))
        );
      }
    }
  }, [isSimulating, isNodeOverGroup, getNodes, setNodes]);

  return {
    isNodeOverGroup,
    createEmptyGroup,
    onNodeDrag,
    onNodeDragStop
  };
};
