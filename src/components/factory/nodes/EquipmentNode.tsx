
import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

export default memo(({ data, selected }: NodeProps) => {
  const isProposed = data.ownership === "proposed";
  
  return (
    <div 
      className={cn(
        "p-3 rounded-lg bg-background border shadow-sm transition-all",
        selected ? "shadow-md" : "shadow-sm",
        isProposed ? "border-blue-400/50 border-2" : "border-border"
      )}
    >
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
    </div>
  );
});
