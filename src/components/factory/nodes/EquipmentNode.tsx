
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EquipmentNodeData {
  name: string;
  type: string;
  cycleTime: number;
  throughput: number;
  dimensions: { width: number; height: number };
  bottleneck?: boolean;
  utilization?: number;
}

const EquipmentNode = ({ data, isConnectable }: NodeProps<EquipmentNodeData>) => {
  const { name, type, cycleTime, throughput, bottleneck, utilization } = data;
  
  return (
    <div 
      className={cn(
        "border rounded-md p-3 shadow-sm bg-background min-w-40",
        bottleneck ? "border-red-500" : "border-border",
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium">{name}</div>
            <Badge variant="outline" className="mt-1">
              {type}
            </Badge>
          </div>
          
          {bottleneck && (
            <Badge variant="destructive">Bottleneck</Badge>
          )}
        </div>
        
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex flex-col">
            <span>Cycle Time</span>
            <span className="font-medium text-foreground">{cycleTime}s</span>
          </div>
          <div className="flex flex-col">
            <span>Throughput</span>
            <span className="font-medium text-foreground">{throughput}/hr</span>
          </div>
          {utilization !== undefined && (
            <div className="flex flex-col col-span-2">
              <span>Utilization</span>
              <div className="w-full bg-secondary rounded-full h-2 mt-1">
                <div 
                  className={cn(
                    "h-2 rounded-full",
                    utilization > 90 ? "bg-red-500" : 
                    utilization > 70 ? "bg-amber-500" : 
                    "bg-green-500"
                  )}
                  style={{ width: `${utilization}%` }}
                ></div>
              </div>
              <span className="font-medium text-foreground">{utilization}%</span>
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default EquipmentNode;
