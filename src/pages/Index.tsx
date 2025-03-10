
import { useState, useEffect } from "react";
import FactoryEditor from "@/components/factory/FactoryEditor";
import EquipmentPanel from "@/components/factory/EquipmentPanel";
import SimulationPanel from "@/components/factory/SimulationPanel";
import { Button } from "@/components/ui/button";
import { Share2, Save } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMode, setSimulationMode] = useState<"instant" | "play-by-play">("instant");
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentUnitPosition, setCurrentUnitPosition] = useState<{
    nodeId: string;
    progress: number;
  } | null>(null);
  const [factoryName, setFactoryName] = useState("Factory Flow Design");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Simulate auto-saving when factory name changes
  useEffect(() => {
    if (factoryName) {
      setIsSaving(true);
      const timer = setTimeout(() => {
        setIsSaving(false);
        // You could add actual save logic here
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [factoryName]);

  const handleShareFactory = () => {
    // In a real implementation, this would generate a unique URL
    const shareableLink = `${window.location.origin}/share/${btoa(factoryName).replace(/=/g, '')}`;

    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: "Link copied to clipboard",
        description: "Share this link to let others view your factory design"
      });
    }).catch(() => {
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive"
      });
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold">Factory Flow</h1>
          <p className="text-muted-foreground">Design and simulate your factory layout</p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <div className="flex items-center text-xs text-muted-foreground">
              <Save size={14} className="mr-1 animate-pulse" />
              Saving...
            </div>
          ) : null}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 size={16} />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h3 className="font-medium">Share your factory design</h3>
                <p className="text-sm text-muted-foreground">Generate a link that allows others to view your factory design in read-only mode.</p>
                <Button onClick={handleShareFactory} className="w-full">
                  Generate shareable link
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Equipment Panel */}
        <div className="w-64 border-r border-border bg-card h-full">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium text-base">{isEditing ? (
              <Input 
                value={factoryName} 
                onChange={e => setFactoryName(e.target.value)} 
                onBlur={() => setIsEditing(false)} 
                onKeyDown={e => e.key === 'Enter' && setIsEditing(false)} 
                className="max-w-[300px] text-base font-medium" 
                autoFocus 
              />
            ) : (
              <span 
                className="cursor-pointer hover:text-primary transition-colors" 
                onClick={() => setIsEditing(true)}
              >
                {factoryName}
              </span>
            )}</h2>
          </div>
          <EquipmentPanel />
        </div>
        
        {/* Factory Editor */}
        <div className="flex-1 relative">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsSimulating(!isSimulating)}
              className={isSimulating ? "text-primary" : ""}
            >
              {isSimulating ? "Stop Simulation" : "Start Simulation"}
            </Button>
          </div>
          <FactoryEditor 
            isSimulating={isSimulating} 
            simulationMode={simulationMode} 
            simulationSpeed={simulationSpeed} 
            onUnitPositionUpdate={setCurrentUnitPosition} 
          />
        </div>
        
        {/* Right Simulation Panel */}
        <div className="w-80 border-l border-border bg-card h-full">
          <SimulationPanel 
            isSimulating={isSimulating} 
            setIsSimulating={setIsSimulating} 
            simulationMode={simulationMode} 
            setSimulationMode={setSimulationMode} 
            currentUnitPosition={currentUnitPosition} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
