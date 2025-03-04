
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
} from "reactflow";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TruckIcon, XIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const { setEdges, deleteElements } = useReactFlow();
  const transitTime = data?.transitTime || 0;
  const edgeRef = useRef<HTMLDivElement>(null);
  
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

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowDeleteButton(true);
    setShowEditIcon(true);
  };

  const handleMouseLeave = () => {
    // Set a timeout before hiding the delete button and edit icon
    const timeout = setTimeout(() => {
      setShowDeleteButton(false);
      setShowEditIcon(false);
    }, 500);
    setHoverTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  const handleDeleteEdge = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          ref={edgeRef}
          className="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            cursor: 'pointer',
            padding: '8px',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Popover open={isEditing} onOpenChange={setIsEditing}>
            <PopoverTrigger asChild>
              <div className="relative inline-block">
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/90 shadow-sm border border-border"
                  onClick={() => setIsEditing(true)}
                >
                  {transitTime > 0 ? `${transitTime}s` : '0s'}
                </Badge>
                {showEditIcon && (
                  <PencilIcon 
                    size={14} 
                    className="text-muted-foreground absolute -top-2 -right-2 bg-background rounded-full p-0.5 shadow-sm"
                  />
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 z-50" side="top" showArrow>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="transitTime">Transit Time (seconds)</Label>
                  <Input
                    id="transitTime"
                    type="number"
                    min="0"
                    step="0.1"
                    value={transitTime}
                    onChange={handleTransitTimeChange}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {showDeleteButton && (
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute -top-6 -right-6 h-5 w-5 rounded-full p-0"
              onClick={handleDeleteEdge}
              onMouseEnter={handleMouseEnter}
            >
              <XIcon size={12} />
            </Button>
          )}

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
