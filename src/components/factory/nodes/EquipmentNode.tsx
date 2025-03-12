import { memo } from 'react';
import { NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';

export default memo(({ data, selected }: NodeProps) => {
  const isProposed = data.ownership === "proposed";
  
  return (
    <div 
      className={cn(
        "p-3 rounded-lg bg-background border transition-shadow",
        selected ? "shadow-md" : "shadow-sm",
        isProposed ? "border-blue-400/50 border-2" : "border-border"
      )}
    >
      <div className="text-sm font-medium mb-1">{data.name}</div>
      <div className="text-xs text-muted-foreground">{data.type}</div>
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
