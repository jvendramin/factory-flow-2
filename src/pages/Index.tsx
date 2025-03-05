
import { useState } from "react";
import FactoryEditor from "@/components/factory/FactoryEditor";
import EquipmentPanel from "@/components/factory/EquipmentPanel";
import SimulationPanel from "@/components/factory/SimulationPanel";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMode, setSimulationMode] = useState<"instant" | "play-by-play">("instant");
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentUnitPosition, setCurrentUnitPosition] = useState<{ nodeId: string, progress: number } | null>(null);
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Sidebar - Equipment Panel */}
      <div className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-bold text-lg">Factory Flow</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </Button>
        </div>
        <EquipmentPanel />
      </div>
      
      {/* Main Content - Factory Editor */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-2 flex justify-end">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="gap-1 bg-transparent">
              <TabsTrigger
                value="editor"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                Editor
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-1 relative">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="editor" className="h-full m-0">
              <FactoryEditor 
                isSimulating={isSimulating} 
                simulationMode={simulationMode}
                simulationSpeed={simulationSpeed}
                onUnitPositionUpdate={setCurrentUnitPosition}
              />
            </TabsContent>
            <TabsContent value="analytics" className="h-full m-0 p-4">
              <div className="bg-muted/30 rounded-lg h-full flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Analytics view is coming soon
                </p>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="h-full m-0 p-4">
              <div className="bg-muted/30 rounded-lg h-full flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Settings view is coming soon
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right Sidebar - Simulation Panel */}
      <div className="w-80 border-l border-border bg-sidebar">
        <SimulationPanel 
          isSimulating={isSimulating} 
          setIsSimulating={setIsSimulating}
          simulationMode={simulationMode}
          setSimulationMode={setSimulationMode}
          currentUnitPosition={currentUnitPosition}
        />
      </div>
    </div>
  );
};

export default Index;
