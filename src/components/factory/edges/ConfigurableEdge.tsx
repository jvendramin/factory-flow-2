
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
} from "reactflow";
import { Badge } from "@/components/ui/badge";
import { TruckIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";

const ConfigurableEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  label
}: EdgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const transitTime = data?.transitTime || 0;
  
  // Use getBezierPath for direct connections between aligned nodes
  // Use getSmoothStepPath for elbow connectors when nodes are not aligned
  const isHorizontallyAligned = Math.abs(sourceY - targetY) < 50;
  const isVerticallyAligned = Math.abs(sourceX - targetX) < 50;
  
  let edgePath = '';
  let labelX = 0;
  let labelY = 0;
  
  if (isHorizontallyAligned || isVerticallyAligned) {
    [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  } else {
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
  }

  const handleTransitTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const event = new CustomEvent('edge:update', {
      detail: {
        id,
        data: {
          ...data,
          transitTime: value
        },
        label: value > 0 ? `${value}s` : undefined
      }
    });
    document.dispatchEvent(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            zIndex: 1,
          }}
        >
          <Popover open={isEditing} onOpenChange={setIsEditing}>
            <PopoverTrigger asChild>
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/90 shadow-sm border border-border"
                onClick={() => setIsEditing(true)}
              >
                {transitTime > 0 ? `${transitTime}s` : '0s'}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" side="top">
              <div className="space-y-2">
                <p className="text-xs font-medium">Transit Time (seconds)</p>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={transitTime}
                  onChange={handleTransitTimeChange}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
            </PopoverContent>
          </Popover>

          {data?.transitInProgress && (
            <div 
              className="absolute top-0 left-0"
              style={{ 
                transform: `translate(${data.transitProgress * 100}%, -50%)`,
                transition: 'transform 0.1s ease-out'
              }}
            >
              <TruckIcon size={18} className="text-primary" />
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ConfigurableEdge;
