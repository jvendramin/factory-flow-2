import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Node, Edge } from "reactflow";
interface LiveStatsPanelProps {
  nodes: Node[];
  edges: Edge[];
}
interface SystemStats {
  totalCycleTime: number;
  estimatedThroughput: number;
  bottleneckName: string | null;
  bottleneckCycleTime: number;
}
const LiveStatsPanel = ({
  nodes,
  edges
}: LiveStatsPanelProps) => {
  const [stats, setStats] = useState<SystemStats>({
    totalCycleTime: 0,
    estimatedThroughput: 0,
    bottleneckName: null,
    bottleneckCycleTime: 0
  });
  useEffect(() => {
    if (nodes.length === 0) return;

    // Build a graph representation
    const graph = new Map<string, string[]>();
    const transitTimes = new Map<string, number>();
    edges.forEach(edge => {
      const sourceNode = edge.source;
      const targetNode = edge.target;
      if (!graph.has(sourceNode)) {
        graph.set(sourceNode, []);
      }
      graph.get(sourceNode)?.push(targetNode);

      // Store transit times
      const edgeId = `${sourceNode}-${targetNode}`;
      transitTimes.set(edgeId, edge.data?.transitTime || 0);
    });

    // Find starting nodes (no incoming edges)
    const allTargets = new Set(edges.map(e => e.target));
    const startNodes = nodes.filter(n => !allTargets.has(n.id)).map(n => n.id);
    if (startNodes.length === 0 && nodes.length > 0) {
      // If no clear start, use the first node
      startNodes.push(nodes[0].id);
    }

    // Calculate the longest path through the system (critical path)
    let maxPathTime = 0;
    let bottleneckNode: Node | null = null;
    const findLongestPath = (nodeId: string, currentTime = 0, visited = new Set<string>()) => {
      if (visited.has(nodeId)) return currentTime;
      visited.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return currentTime;
      const nodeCycleTime = node.data?.cycleTime || 0;
      const nodeMaxCapacity = node.data?.maxCapacity || 1;
      // Adjust cycle time based on concurrent capacity
      const adjustedCycleTime = nodeMaxCapacity > 1 ? nodeCycleTime / nodeMaxCapacity : nodeCycleTime;

      // Update bottleneck if this is the slowest node so far
      if (adjustedCycleTime > (bottleneckNode?.data?.cycleTime || 0)) {
        bottleneckNode = node;
      }

      // Add this node's time to the path
      const newTime = currentTime + adjustedCycleTime;

      // If no next nodes, return current path time
      const nextNodes = graph.get(nodeId) || [];
      if (nextNodes.length === 0) return newTime;

      // Find the longest path from here
      let maxNextTime = 0;
      for (const nextNodeId of nextNodes) {
        const edgeId = `${nodeId}-${nextNodeId}`;
        const transitTime = transitTimes.get(edgeId) || 0;
        const nextPathTime = findLongestPath(nextNodeId, newTime + transitTime, new Set(visited));
        maxNextTime = Math.max(maxNextTime, nextPathTime);
      }
      return maxNextTime;
    };

    // Calculate longest path from each starting node
    for (const startNode of startNodes) {
      const pathTime = findLongestPath(startNode);
      maxPathTime = Math.max(maxPathTime, pathTime);
    }

    // Calculate estimated throughput based on bottleneck
    let throughput = 0;
    if (bottleneckNode) {
      const bottleneckCycleTime = bottleneckNode.data?.cycleTime || 0;
      const bottleneckMaxCapacity = bottleneckNode.data?.maxCapacity || 1;

      // Adjust cycle time for concurrent capacity
      const adjustedBottleneckTime = bottleneckMaxCapacity > 1 ? bottleneckCycleTime / bottleneckMaxCapacity : bottleneckCycleTime;
      if (adjustedBottleneckTime > 0) {
        // Units per hour = (3600 seconds per hour / cycle time) * concurrent capacity
        throughput = Math.floor(3600 / adjustedBottleneckTime);
      }
      setStats({
        totalCycleTime: maxPathTime,
        estimatedThroughput: throughput,
        bottleneckName: bottleneckNode?.data?.name || null,
        bottleneckCycleTime: adjustedBottleneckTime
      });
    } else {
      setStats({
        totalCycleTime: maxPathTime,
        estimatedThroughput: 0,
        bottleneckName: null,
        bottleneckCycleTime: 0
      });
    }
  }, [nodes, edges]);
  return <Card className="mt-4">
      <CardContent className="w-full">
        <h3 className="text-sm font-medium mb-3">Live System Stats</h3>
        
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Cycle Time</span>
            <span className="font-medium">{stats.totalCycleTime.toFixed(1)}s</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Est. Throughput</span>
            <span className="font-medium">{stats.estimatedThroughput} units/hr</span>
          </div>
          
          {stats.bottleneckName && <div className="col-span-2 flex flex-col">
              <span className="text-xs text-muted-foreground">Bottleneck</span>
              <span className="font-medium text-destructive">{stats.bottleneckName} ({stats.bottleneckCycleTime.toFixed(1)}s)</span>
            </div>}
        </div>
      </CardContent>
    </Card>;
};
export default LiveStatsPanel;