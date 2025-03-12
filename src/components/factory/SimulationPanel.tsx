
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { PlayIcon, PauseIcon, SquareIcon, LineChartIcon, ZapIcon, TimerIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import PDFGenerator from "./PDFGenerator";

interface SimulationPanelProps {
  isSimulating: boolean;
  setIsSimulating: (value: boolean) => void;
  simulationMode: "instant" | "play-by-play";
  setSimulationMode: (mode: "instant" | "play-by-play") => void;
  currentUnitPosition?: {
    nodeId: string;
    progress: number;
  } | null;
}

const SimulationPanel = ({
  isSimulating,
  setIsSimulating,
  simulationMode,
  setSimulationMode,
  currentUnitPosition
}: SimulationPanelProps) => {
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [simulationUnits, setSimulationUnits] = useState(1);
  const [runningBatch, setRunningBatch] = useState(false);
  const [currentBatchProgress, setCurrentBatchProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("simulate");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [simulationResults, setSimulationResults] = useState<{
    throughput: number;
    cycleTime: number;
    utilization: number;
    bottlenecks: string[];
  } | null>(null);

  const handleStartSimulation = () => {
    setIsSimulating(true);
    if (simulationMode === "instant") {
      if (simulationUnits > 1) {
        setRunningBatch(true);
        setCurrentBatchProgress(0);
        const batchSize = simulationUnits;
        let results = {
          throughput: 0,
          cycleTime: 0,
          utilization: 0,
          bottlenecks: new Map<string, number>()
        };
        const chunkSize = Math.min(Math.max(Math.floor(batchSize / 10), 1), 1000);
        let processedUnits = 0;
        const processChunk = () => {
          const startTime = performance.now();
          const endUnit = Math.min(processedUnits + chunkSize, batchSize);
          for (let i = processedUnits; i < endUnit; i++) {
            const mockResult = getMockSimulationResult();
            results.throughput += mockResult.throughput;
            results.cycleTime += mockResult.cycleTime;
            results.utilization += mockResult.utilization;
            mockResult.bottlenecks.forEach(bottleneck => {
              const count = results.bottlenecks.get(bottleneck) || 0;
              results.bottlenecks.set(bottleneck, count + 1);
            });
          }
          processedUnits = endUnit;
          const progress = Math.floor(processedUnits / batchSize * 100);
          setCurrentBatchProgress(progress);
          if (processedUnits < batchSize) {
            setTimeout(processChunk, 0);
          } else {
            const finalResults = {
              throughput: +(results.throughput / batchSize).toFixed(1),
              cycleTime: +(results.cycleTime / batchSize).toFixed(1),
              utilization: +(results.utilization / batchSize).toFixed(1),
              bottlenecks: Array.from(results.bottlenecks.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name)
            };
            setSimulationResults(finalResults);
            setRunningBatch(false);
            toast({
              title: "Batch Simulation Complete",
              description: `Processed ${batchSize} units successfully`
            });
          }
        };
        processChunk();
      } else {
        setTimeout(() => {
          setSimulationResults(getMockSimulationResult());
        }, 1000);
      }
    }
  };

  const getMockSimulationResult = () => {
    return {
      throughput: 115 + Math.random() * 10,
      cycleTime: 33 + Math.random() * 5,
      utilization: 75 + Math.random() * 7,
      bottlenecks: ["Assembly Station 2", "CNC Milling Machine", "Packaging Machine"].slice(0, 1 + Math.floor(Math.random() * 2))
    };
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    setRunningBatch(false);
    setCurrentBatchProgress(0);
    setSimulationResults(null);
  };

  const handleSimulationModeChange = (value: string) => {
    if (value === "instant" || value === "play-by-play") {
      setSimulationMode(value);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-1 border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 flex items-center justify-center">
            <TabsList className="gap-1 bg-transparent">
              <TabsTrigger value="simulate" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none">
                Simulate
              </TabsTrigger>
              <TabsTrigger value="tools" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none">
                Tools
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <Tabs value={activeTab} defaultValue="simulate">
            <TabsContent value="simulate" className="m-0 space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">Simulation Mode</h3>
                <ToggleGroup type="single" value={simulationMode} onValueChange={handleSimulationModeChange} className="justify-start mb-4">
                  <ToggleGroupItem value="instant" className="flex gap-1.5 items-center">
                    <ZapIcon className="h-3.5 w-3.5" />
                    <span>Instant</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="play-by-play" className="flex gap-1.5 items-center">
                    <TimerIcon className="h-3.5 w-3.5" />
                    <span>Play-by-Play</span>
                  </ToggleGroupItem>
                </ToggleGroup>
                
                <h3 className="text-sm font-medium mb-2">Simulation Controls</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Speed:</span>
                    <div className="flex-1 mx-4">
                      <Slider value={[simulationSpeed]} min={0.1} max={2} step={0.1} onValueChange={value => setSimulationSpeed(value[0])} disabled={isSimulating} />
                    </div>
                    <span className="text-sm font-medium">{simulationSpeed}x</span>
                  </div>
                  
                  {simulationMode === "instant" && <div className="flex items-center justify-between">
                      <span className="text-sm">Units:</span>
                      <div className="flex-1 mx-4">
                        <Input type="number" min={1} max={100000} value={simulationUnits} onChange={e => setSimulationUnits(Math.max(1, parseInt(e.target.value) || 1))} disabled={isSimulating} className="h-8" />
                      </div>
                    </div>}
                  
                  {runningBatch && <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{
                    width: `${currentBatchProgress}%`
                  }}></div>
                      <div className="text-xs text-center mt-1">{currentBatchProgress}% complete</div>
                    </div>}
                  
                  <div className="flex space-x-2">
                    {!isSimulating ? <Button onClick={handleStartSimulation} className="flex-1">
                        <PlayIcon className="mr-2 h-4 w-4" />
                        Start
                      </Button> : <>
                        <Button variant="outline" onClick={() => setIsSimulating(false)} className="flex-1">
                          <PauseIcon className="mr-2 h-4 w-4" />
                          Pause
                        </Button>
                        <Button variant="destructive" onClick={handleStopSimulation} className="flex-1">
                          <SquareIcon className="mr-2 h-4 w-4" />
                          Stop
                        </Button>
                      </>}
                  </div>
                </div>
              </Card>
              
              {simulationResults && <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">
                      {simulationUnits > 1 ? `Results (${simulationUnits} units)` : 'Simulation Results'}
                    </h3>
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
                      {simulationResults.bottlenecks.map((bottleneck, index) => <div key={index} className="text-sm font-medium text-destructive">
                          {bottleneck}
                        </div>)}
                    </div>
                  </div>
                </Card>}
            </TabsContent>

            <TabsContent value="tools" className="m-0 space-y-4">
              <Card className="p-4">
                <PDFGenerator />
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="m-0 space-y-4">
              <Card className="p-4">
                <h3 className="text-sm font-medium mb-3">Application Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Auto-save</Label>
                      <p className="text-xs text-muted-foreground">Automatically save your factory design</p>
                    </div>
                    <Button variant={autoSave ? "default" : "outline"} size="sm" onClick={() => setAutoSave(!autoSave)}>
                      {autoSave ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Notifications</Label>
                      <p className="text-xs text-muted-foreground">Enable simulation completion notifications</p>
                    </div>
                    <Button variant={notificationsEnabled ? "default" : "outline"} size="sm" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
                      {notificationsEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm">Simulation Parameters</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input type="number" placeholder="Default transit time (s)" className="h-8" />
                      <Input type="number" placeholder="Processing time (s)" className="h-8" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm">Export Options</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button variant="outline" size="sm">
                        Export as JSON
                      </Button>
                      <Button variant="outline" size="sm">
                        Export as CSV
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm">Reset Factory</Label>
                    <div className="mt-2">
                      <Button variant="destructive" size="sm" className="w-full">
                        Reset All Data
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will clear all your factory design data and cannot be undone.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SimulationPanel;
