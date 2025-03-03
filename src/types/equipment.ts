
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
  maxCapacity?: number;
  energy?: number; // energy consumption
}
