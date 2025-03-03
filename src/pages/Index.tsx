
import { useState } from "react";
import FactoryEditor from "@/components/factory/FactoryEditor";
import EquipmentPanel from "@/components/factory/EquipmentPanel";
import SimulationPanel from "@/components/factory/SimulationPanel";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [isSimulating, setIsSimulating] = useState(false);

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
        <div className="flex-1 relative">
          <FactoryEditor isSimulating={isSimulating} />
        </div>
      </div>
      
      {/* Right Sidebar - Simulation Panel */}
      <div className="w-80 border-l border-border bg-sidebar">
        <SimulationPanel 
          isSimulating={isSimulating} 
          setIsSimulating={setIsSimulating} 
        />
      </div>
    </div>
  );
};

export default Index;
