
import { Equipment } from "@/types/equipment";

export const equipmentLibrary: Equipment[] = [
  {
    id: "cnc-mill",
    name: "CNC Milling Machine",
    type: "Machining",
    description: "Computer-controlled subtractive manufacturing process",
    cycleTime: 180,
    throughput: 20,
    dimensions: { width: 200, height: 150 },
    maintenanceInterval: 168, // 1 week
    setupTime: 45,
    energy: 15 // kW
  },
  {
    id: "injection-molder",
    name: "Injection Molding Machine",
    type: "Forming",
    description: "Produces parts by injecting molten material into a mold",
    cycleTime: 25,
    throughput: 144,
    dimensions: { width: 250, height: 200 },
    maintenanceInterval: 336, // 2 weeks
    setupTime: 120,
    energy: 35 // kW
  },
  {
    id: "assembly-station",
    name: "Assembly Station",
    type: "Assembly",
    description: "Manual assembly workstation with tools and fixtures",
    cycleTime: 90,
    throughput: 40,
    dimensions: { width: 150, height: 100 },
    maintenanceInterval: 720, // 1 month
    setupTime: 15,
    maxCapacity: 1
  },
  {
    id: "robot-arm",
    name: "Robotic Arm",
    type: "Automation",
    description: "Programmable mechanical arm for various tasks",
    cycleTime: 15,
    throughput: 240,
    dimensions: { width: 100, height: 100 },
    maintenanceInterval: 500,
    setupTime: 60,
    energy: 5 // kW
  },
  {
    id: "conveyor",
    name: "Conveyor Belt",
    type: "Material Handling",
    description: "Continuous moving belt for material transport",
    cycleTime: 5,
    throughput: 720,
    dimensions: { width: 300, height: 50 },
    maintenanceInterval: 1000,
    energy: 2 // kW
  },
  {
    id: "packaging",
    name: "Packaging Machine",
    type: "Packaging",
    description: "Automated system for product packaging",
    cycleTime: 20,
    throughput: 180,
    dimensions: { width: 200, height: 150 },
    maintenanceInterval: 400,
    setupTime: 30,
    energy: 8 // kW
  },
  {
    id: "inspection",
    name: "Quality Inspection Station",
    type: "Quality Control",
    description: "Automated vision system for quality inspection",
    cycleTime: 10,
    throughput: 360,
    dimensions: { width: 120, height: 80 },
    maintenanceInterval: 720,
    energy: 3 // kW
  },
  {
    id: "warehouse-rack",
    name: "Warehouse Rack",
    type: "Storage",
    description: "Storage racks for finished goods or raw materials",
    cycleTime: 0,
    throughput: 0,
    dimensions: { width: 150, height: 300 },
    maxCapacity: 500
  }
];
