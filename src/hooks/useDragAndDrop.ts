
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useReactFlow, Node } from 'reactflow';

export const useDragAndDrop = () => {
  const [placeholderNode, setPlaceholderNode] = useState<Node | null>(null);
  const { getNodes, setNodes } = useReactFlow();

  // Handle dropping new equipment onto the canvas
  const onDrop = useCallback(
    (event: React.DragEvent, reactFlowInstance: any, reactFlowWrapper: React.RefObject<HTMLDivElement>) => {
      event.preventDefault();
      setPlaceholderNode(null);

      if (!reactFlowInstance || !reactFlowWrapper.current) {
        return;
      }

      // Parse the dragged equipment data
      const equipmentData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      
      if (typeof equipmentData.type !== 'string') {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Check if dropping inside a group
      const groups = getNodes().filter(n => n.type === 'group');
      
      // Find which group (if any) the position is inside of
      let parentGroup = null;
      for (const group of groups) {
        const width = group.style?.width as number || 300;
        const height = group.style?.height as number || 200;
        
        if (
          position.x > group.position.x && 
          position.x < group.position.x + width &&
          position.y > group.position.y && 
          position.y < group.position.y + height
        ) {
          parentGroup = group;
          break;
        }
      }
      
      // Set position based on whether we're dropping in a group
      let newNodePosition = position;
      let parentNodeId = undefined;
      
      if (parentGroup) {
        // Calculate position relative to the group
        newNodePosition = {
          x: position.x - parentGroup.position.x,
          y: position.y - parentGroup.position.y
        };
        parentNodeId = parentGroup.id;
      }

      // Create the new node
      const newNode = {
        id: `equipment-${Date.now()}`,
        type: 'equipment',
        position: newNodePosition,
        parentNode: parentNodeId,
        extent: parentNodeId ? 'parent' as const : undefined,
        data: { 
          ...equipmentData,
          maxCapacity: equipmentData.maxCapacity || 1 
        },
      };

      // Add the node to the canvas
      setNodes((nds) => nds.concat(newNode));
      
      // If adding to a group, update the group data
      if (parentGroup) {
        setNodes(nds => 
          nds.map(n => {
            if (n.id === parentGroup.id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  nodes: [...(n.data.nodes || []), newNode.id]
                }
              };
            }
            return n;
          })
        );
      }

      toast({
        title: `Added ${equipmentData.name}`,
        description: `${equipmentData.name} has been added to the factory floor`,
      });
    },
    [getNodes, setNodes]
  );

  // Handle drag over events for live preview
  const onDragOver = useCallback((event: React.DragEvent, reactFlowInstance: any, reactFlowWrapper: React.RefObject<HTMLDivElement>) => {
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
      // Silent error handling for drag operations
    }
    
  }, [placeholderNode, setNodes]);
  
  // Handle drag leave events
  const onDragLeave = useCallback(() => {
    if (placeholderNode) {
      setNodes(nds => nds.filter(n => n.id !== 'placeholder'));
      setPlaceholderNode(null);
    }
  }, [placeholderNode, setNodes]);

  return {
    placeholderNode,
    onDrop,
    onDragOver,
    onDragLeave
  };
};
