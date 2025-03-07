
export interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  cycleTime: number; // in seconds
  throughput: number; // units per hour
  dimensions: {
    width: number;
    height: number;
  };
  maintenanceInterval?: number; // in hours
  setupTime?: number; // in minutes
  maxCapacity?: number; // concurrent units that can be processed
  energy?: number; // energy consumption
  active?: boolean; // whether the equipment is currently active
  progress?: number; // progress of current operation (0-1)
  bottleneck?: boolean; // whether this equipment is a bottleneck
  utilization?: number; // percentage of utilization
  placeholder?: boolean; // whether this is a placeholder node
  groupId?: string; // unique identifier for group membership
  groupPosition?: number; // position within group for vertical alignment
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  transitTime?: number; // in seconds
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
  type?: string;
  transitInProgress?: boolean;
  transitProgress?: number; // 0 to 1
}

export interface PathStep {
  nodeId: string;
  transitTime?: number;
}

export interface GroupData {
  id: string;
  label: string;
  nodes: string[]; // IDs of nodes in this group
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
