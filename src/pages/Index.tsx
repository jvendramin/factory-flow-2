import { useState, useEffect } from "react";
import FactoryEditor from "@/components/factory/FactoryEditor";
import EquipmentPanel from "@/components/factory/EquipmentPanel";
import SimulationPanel from "@/components/factory/SimulationPanel";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, Save, Share2 } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
const Index = () => {
  const {
    theme,
    setTheme
  } = useTheme();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMode, setSimulationMode] = useState<"instant" | "play-by-play">("instant");
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentUnitPosition, setCurrentUnitPosition] = useState<{
    nodeId: string;
    progress: number;
  } | null>(null);
  const [factoryName, setFactoryName] = useState("My Factory");
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
  return <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Sidebar - Equipment Panel */}
      <div className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-bold text-lg">Factory Flow</h1>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </Button>
        </div>
        <EquipmentPanel />
      </div>
      
      {/* Main Content - Factory Editor */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSaving ? <div className="flex items-center text-xs text-muted-foreground">
                <Save size={14} className="mr-1 animate-pulse" />
                Saving...
              </div> : <div className="flex items-center text-xs text-muted-foreground pl-3">
                
                Saved
              </div>}
          </div>
          
          {isEditing ? <Input value={factoryName} onChange={e => setFactoryName(e.target.value)} onBlur={() => setIsEditing(false)} onKeyDown={e => e.key === 'Enter' && setIsEditing(false)} className="max-w-[300px] text-center font-medium" autoFocus /> : <h2 className="font-medium text-center cursor-pointer hover:text-primary transition-colors" onClick={() => setIsEditing(true)}>
              {factoryName}
            </h2>}
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
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
        <div className="flex-1 relative">
          <FactoryEditor isSimulating={isSimulating} simulationMode={simulationMode} simulationSpeed={simulationSpeed} onUnitPositionUpdate={setCurrentUnitPosition} />
        </div>
      </div>
      
      {/* Right Sidebar - Simulation Panel */}
      <div className="w-80 border-l border-border bg-sidebar">
        <SimulationPanel isSimulating={isSimulating} setIsSimulating={setIsSimulating} simulationMode={simulationMode} setSimulationMode={setSimulationMode} currentUnitPosition={currentUnitPosition} />
      </div>
    </div>;
};
export default Index;