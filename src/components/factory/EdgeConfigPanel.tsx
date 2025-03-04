
import { useCallback } from "react";
import { Edge, useReactFlow } from "reactflow";
import { FlowEdge } from "@/types/equipment";

interface EdgeConfigPanelProps {
  edge: Partial<Edge> & Pick<FlowEdge, 'id'>;
}

// This component is now a utility for edge updates
// Actual UI is handled in ConfigurableEdge.tsx
const EdgeConfigPanel = ({ edge }: EdgeConfigPanelProps) => {
  const { setEdges } = useReactFlow();
  
  // Set up event listener for edge updates from the badge component
  useCallback(() => {
    const handleEdgeUpdate = (event: CustomEvent) => {
      const { id, data, label } = event.detail;
      
      if (id === edge.id) {
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
      }
    };
    
    document.addEventListener('edge:update', handleEdgeUpdate as EventListener);
    
    return () => {
      document.removeEventListener('edge:update', handleEdgeUpdate as EventListener);
    };
  }, [edge.id, setEdges]);
  
  return null;
};

export default EdgeConfigPanel;
