
import { useCallback } from "react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Edge, useReactFlow } from "reactflow";
import { FlowEdge } from "@/types/equipment";

interface EdgeConfigPanelProps {
  edge: Partial<Edge> & Pick<FlowEdge, 'id'>;
}

const EdgeConfigPanel = ({ edge }: EdgeConfigPanelProps) => {
  const { setEdges } = useReactFlow();
  
  const updateTransitTime = useCallback((value: number) => {
    setEdges(edges => 
      edges.map(e => {
        if (e.id === edge.id) {
          return {
            ...e,
            data: {
              ...e.data,
              transitTime: value
            },
            label: value > 0 ? `${value}s` : undefined
          };
        }
        return e;
      })
    );
  }, [edge.id, setEdges]);
  
  const transitTime = edge.data?.transitTime || 0;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-full shadow-sm border border-border"
        >
          <Settings className="h-3 w-3" />
          <span className="sr-only">Configure edge</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60" align="center" alignOffset={0} side="top">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Edge Configuration</h4>
          <div className="space-y-1">
            <Label htmlFor="transitTime">Transit Time (seconds)</Label>
            <Input
              id="transitTime"
              type="number"
              min="0"
              step="0.1"
              value={transitTime}
              onChange={(e) => updateTransitTime(parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Time it takes for a unit to move between equipment
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EdgeConfigPanel;
