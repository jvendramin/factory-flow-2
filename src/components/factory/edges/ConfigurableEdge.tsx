
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
} from "reactflow";
import { TruckIcon } from "lucide-react";
import EdgeConfigPanel from "../EdgeConfigPanel";

const ConfigurableEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
  label
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

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
          <EdgeConfigPanel edge={{ id, source, target, data, label }} />
          {label && (
            <div 
              className="bg-background px-1 py-0.5 rounded text-xs border border-border absolute top-6 left-1/2 transform -translate-x-1/2"
            >
              {label}
            </div>
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
