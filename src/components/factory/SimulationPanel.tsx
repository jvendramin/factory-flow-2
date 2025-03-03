
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { PlayIcon, PauseIcon, StopIcon, SettingsIcon, LineChartIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SimulationPanelProps {
  isSimulating: boolean;
  setIsSimulating: (value: boolean) => void;
}

const SimulationPanel = ({ isSimulating, setIsSimulating }: SimulationPanelProps) => {
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [simulationResults, setSimulationResults] = useState<{
    throughput: number;
    cycleTime: number;
    utilization: number;
    bottlenecks: string[];
  } | null>(null);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    
    // In a real app, this would trigger the actual simulation
    // This is just a mock result for demonstration
    setTimeout(() => {
      setSimulationResults({
        throughput: 120,
        cycleTime: 35.2,
        utilization: 78.3,
        bottlenecks: ["Assembly Station 2"],
      });
    }, 1000);
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    setSimulationResults(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-medium">Simulation</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-2">Simulation Controls</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Speed:</span>
                <div className="flex-1 mx-4">
                  <Slider
                    value={[simulationSpeed]}
                    min={0.1}
                    max={2}
                    step={0.1}
                    onValueChange={(value) => setSimulationSpeed(value[0])}
                    disabled={isSimulating}
                  />
                </div>
                <span className="text-sm font-medium">{simulationSpeed}x</span>
              </div>
              
              <div className="flex space-x-2">
                {!isSimulating ? (
                  <Button 
                    onClick={handleStartSimulation} 
                    className="flex-1"
                  >
                    <PlayIcon className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsSimulating(false)} 
                      className="flex-1"
                    >
                      <PauseIcon className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleStopSimulation} 
                      className="flex-1"
                    >
                      <StopIcon className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
          
          {simulationResults && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Simulation Results</h3>
                <Button variant="ghost" size="icon">
                  <LineChartIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground">Throughput</div>
                  <div className="text-lg font-semibold">{simulationResults.throughput} units/hr</div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground">Average Cycle Time</div>
                  <div className="text-lg font-semibold">{simulationResults.cycleTime} seconds</div>
                </div>
                
                <div>
                  <div className="text-xs text-muted-foreground">Overall Utilization</div>
                  <div className="text-lg font-semibold">{simulationResults.utilization}%</div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="text-xs text-muted-foreground">Bottlenecks</div>
                  {simulationResults.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="text-sm font-medium text-destructive">
                      {bottleneck}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
          
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Simulation Settings</h3>
              <Button variant="ghost" size="icon">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Configure advanced simulation parameters like shift duration, 
              worker allocations, and product mix.
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SimulationPanel;
