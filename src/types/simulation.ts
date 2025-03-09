
import { Node, Edge } from 'reactflow';

// Simulation hook input props
export interface SimulationHookProps {
  isSimulating: boolean;
  simulationMode?: "instant" | "play-by-play";
  simulationSpeed?: number;
  onUnitPositionUpdate?: (position: { nodeId: string, progress: number } | null) => void;
}

// Path tracking data 
export interface ActivePath {
  nodeId: string;
  progress: number;
  inTransit: boolean;
  transitTo: string;
  transitTime: number;
  transitProgress: number;
}

// Edge connection data
export interface EdgeConnection {
  targetId: string;
  transitTime: number;
}
