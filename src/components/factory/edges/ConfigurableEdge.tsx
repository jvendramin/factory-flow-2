
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  useReactFlow,
} from "reactflow";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Extend EdgeProps to include className property
interface ConfigurableEdgeProps extends EdgeProps {
  className?: string;
}

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
  label,
  className,
}: ConfigurableEdgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
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
    setShowButtons(true);
  };

  const handleMouseLeave = () => {
    // Set a timeout before hiding the buttons
    const timeout = setTimeout(() => {
      setShowButtons(false);
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
  
  // If this is a temporary edge (during proximity connection), use dashed styling
  const isTemp = className === 'temp';
  const combinedStyle = {
    ...style,
    ...(isTemp ? { 
      strokeDasharray: '5,5',
      stroke: 'hsl(var(--primary))',
      strokeWidth: 1.5,
      animation: 'dashdraw 0.5s linear infinite'
    } : {})
  };

  // For the glowing transit animation
  const transitInProgress = data?.transitInProgress;
  const transitProgress = data?.transitProgress || 0;

  // Calculate path length for the animation
  const pathLength = 1000; // Fixed value for consistent animation

  return (
    <>
      {/* Base edge */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={combinedStyle} 
      />
      
      {/* Enhanced transit animation overlay */}
      {transitInProgress && (
        <>
          {/* Background pulse effect */}
          <path
            d={edgePath}
            stroke="hsl(var(--primary)/0.2)"
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
            className="transit-background-pulse"
          />
          
          {/* Main glow effect */}
          <path
            d={edgePath}
            stroke="hsl(var(--primary))"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={`${pathLength}`}
            strokeDashoffset={(1 - transitProgress) * pathLength}
            fill="none"
            className="transit-glow-effect"
            style={{
              filter: "drop-shadow(0 0 6px hsl(var(--primary)))",
              transition: `stroke-dashoffset ${Math.min(0.05, transitTime * 0.01)}s linear`
            }}
          />
          
          {/* Leading particle effect */}
          <circle 
            r={4}
            fill="white"
            filter="drop-shadow(0 0 8px hsl(var(--primary)))"
            className="transit-particle"
            style={{
              offset: `${transitProgress * 100}% 0`,
              offsetPath: `path('${edgePath}')`,
            }}
          />
        </>
      )}
      
      {/* Only show controls if this is not a temporary edge */}
      {!isTemp && (
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
                    variant={transitInProgress ? "default" : "secondary"}
                    className={`cursor-pointer hover:bg-secondary/90 shadow-sm border border-border ${transitInProgress ? 'animate-pulse' : ''}`}
                    onClick={() => setIsEditing(true)}
                  >
                    {transitTime > 0 ? `${transitTime}s` : '0s'}
                  </Badge>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 z-50" side="top">
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

            {showButtons && (
              <div 
                className="absolute -top-8 -right-1 inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse"
                onMouseEnter={handleMouseEnter}
              >
                <Button
                  className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 h-6 w-6"
                  variant="outline"
                  size="icon"
                  aria-label="Edit"
                  onClick={() => setIsEditing(true)}
                >
                  <PencilIcon size={12} strokeWidth={2} aria-hidden="true" />
                </Button>
                <Button
                  className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 h-6 w-6"
                  variant="outline"
                  size="icon"
                  aria-label="Delete"
                  onClick={handleDeleteEdge}
                >
                  <TrashIcon size={12} strokeWidth={2} aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default ConfigurableEdge;
