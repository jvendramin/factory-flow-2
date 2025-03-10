import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Clock, Activity, Zap, Thermometer } from "lucide-react";
interface CollapsibleStatsPanelProps {
  isSimulating: boolean;
  simulationTime: number;
  throughput: number;
  efficiency: number;
  energyUsage: number;
  temperature: number;
}
const CollapsibleStatsPanel: React.FC<CollapsibleStatsPanelProps> = ({
  isSimulating,
  simulationTime,
  throughput,
  efficiency,
  energyUsage,
  temperature
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Format simulation time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  return <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Live Statistics</h3>
          {isSimulating && <div className="flex items-center gap-1 text-xs">
              <Clock size={12} className="text-muted-foreground" />
              <span className="text-muted-foreground">{formatTime(simulationTime)}</span>
            </div>}
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="px-4 pt-4 pb-2">
          <div className="grid grid-cols-4 gap-2">
            <Card>
              <div className="p-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity size={10} /> Throughput
                  </span>
                  <span className="text-md font-semibold">{throughput}</span>
                  <Progress value={throughput} className="h-1 mt-1" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap size={10} /> Efficiency
                  </span>
                  <span className="text-md font-semibold">{efficiency}%</span>
                  <Progress value={efficiency} className="h-1 mt-1" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap size={10} /> Energy
                  </span>
                  <span className="text-md font-semibold">{energyUsage} kW</span>
                  <Progress value={energyUsage / 2} className="h-1 mt-1" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Thermometer size={10} /> Temp
                  </span>
                  <span className="text-md font-semibold">{temperature}°C</span>
                  <Progress value={temperature / 1.5} className="h-1 mt-1" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>;
};
export default CollapsibleStatsPanel;