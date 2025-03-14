
import { memo } from 'react';
import { NodeProps, Handle, Position, useReactFlow } from 'reactflow';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default memo(({ data, selected, id }: NodeProps) => {
  const isProposed = data.ownership === "proposed";
  const { deleteElements } = useReactFlow();
  
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };
  
  return (
    <div 
      className={cn(
        "p-3 rounded-lg bg-background border shadow-sm transition-all relative",
        selected ? "shadow-md" : "shadow-sm",
        isProposed ? "border-blue-400/50 border-2" : "border-border"
      )}
    >
      {/* Input Handle - Top */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-background border-2 border-muted-foreground"
      />
      
      <div className="absolute top-1 right-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="font-medium">{data.name}</div>
        </div>
        
        <Badge variant="outline" className="w-fit">
          {data.type}
        </Badge>
        
        {(data.cycleTime !== undefined || data.throughput !== undefined) && (
          <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            {data.cycleTime !== undefined && (
              <div>
                <span>Cycle Time: </span>
                <span className="font-medium text-foreground">{data.cycleTime}s</span>
              </div>
            )}
            {data.throughput !== undefined && (
              <div>
                <span>Throughput: </span>
                <span className="font-medium text-foreground">{data.throughput}/hr</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {data.progress !== undefined && (
        <div className="w-full bg-secondary rounded-full h-1 mt-2">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${data.progress * 100}%` }}
          />
        </div>
      )}

      {/* Output Handle - Bottom */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-background border-2 border-muted-foreground"
      />
    </div>
  );
});
