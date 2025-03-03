
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
