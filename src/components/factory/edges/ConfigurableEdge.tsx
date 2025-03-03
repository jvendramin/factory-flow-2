
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "reactflow";
import EdgeConfigPanel from "../EdgeConfigPanel";

const ConfigurableEdge = ({
  id,
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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
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
          <EdgeConfigPanel edge={{ id, data, label }} />
          {label && (
            <div 
              className="bg-background px-1 py-0.5 rounded text-xs border border-border absolute top-6 left-1/2 transform -translate-x-1/2"
            >
              {label}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default ConfigurableEdge;
