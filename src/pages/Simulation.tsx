
import React, { useState } from "react";
import FactoryEditor from "@/components/factory/FactoryEditor";
import EquipmentPanel from "@/components/factory/EquipmentPanel";
import SimulationPanel from "@/components/factory/SimulationPanel";
import { Button } from "@/components/ui/button";
import { Share2, Plus, Download, FileJson } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import AddEquipmentForm from "@/components/factory/AddEquipmentForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Simulation = () => {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [simulationMode, setSimulationMode] = React.useState<"instant" | "play-by-play">("instant");
  const [addEquipmentOpen, setAddEquipmentOpen] = useState(false);
  const [showPDFDialog, setShowPDFDialog] = useState(false);
  
  const handleShareFactory = () => {
    const shareableLink = `${window.location.origin}/share/${btoa(Date.now().toString())}`;
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: "Link copied to clipboard",
        description: "Share this link to let others view your factory design"
      });
    });
  };

  const handleExportCanvas = (format: 'pdf' | 'json') => {
    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: `Your factory design is being exported as ${format.toUpperCase()}`
    });
    // Simulate export delay
    setTimeout(() => {
      toast({
        title: "Export Completed",
        description: `Your factory design has been exported as ${format.toUpperCase()}`
      });
    }, 1500);
  };
  
  // This event will be triggered from the PDF generator component
  React.useEffect(() => {
    const handlePDFGenerated = () => {
      setShowPDFDialog(true);
    };
    
    document.addEventListener('pdf:generated', handlePDFGenerated as EventListener);
    return () => {
      document.removeEventListener('pdf:generated', handlePDFGenerated as EventListener);
    };
  }, []);
  
  return (
    <div className="flex w-full h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Equipment Panel */}
      <div className="w-64 border-r border-border bg-card h-full">
        <EquipmentPanel addProposedMode={true} />
      </div>
      
      {/* Factory Editor */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Popover open={addEquipmentOpen} onOpenChange={setAddEquipmentOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus size={16} />
                Add Equipment
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <AddEquipmentForm 
                onEquipmentAdded={() => setAddEquipmentOpen(false)}
              />
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 size={16} />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h3 className="font-medium">Share your factory design</h3>
                <p className="text-sm text-muted-foreground">Generate a link that allows others to view your factory design in read-only mode.</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleShareFactory} className="w-full">
                    Generate shareable link
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={() => handleExportCanvas('pdf')} variant="outline" size="sm" className="gap-1">
                      <Download size={14} />
                      Export as PDF
                    </Button>
                    <Button onClick={() => handleExportCanvas('json')} variant="outline" size="sm" className="gap-1">
                      <FileJson size={14} />
                      Export as JSON
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <FactoryEditor isSimulating={isSimulating} simulationMode={simulationMode} simulationSpeed={1} onUnitPositionUpdate={() => {}} />
      </div>
      
      {/* Right Simulation Panel */}
      <div className="w-80 border-l border-border bg-card h-full overflow-hidden">
        <SimulationPanel isSimulating={isSimulating} setIsSimulating={setIsSimulating} simulationMode={simulationMode} setSimulationMode={setSimulationMode} />
      </div>
      
      {/* PDF Preview Dialog */}
      <Dialog open={showPDFDialog} onOpenChange={setShowPDFDialog}>
        <DialogContent className="max-w-4xl">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">PDF Preview</h2>
            <div className="border rounded-md p-4 aspect-[8.5/11] bg-white">
              <div className="flex flex-col h-full">
                <div className="text-2xl font-bold mb-4 text-center">Factory Simulation Report</div>
                <div className="border-b pb-4 mb-4">
                  <div className="font-semibold text-lg">Your Company Name</div>
                  <div className="text-muted-foreground">Contact Information</div>
                </div>
                <div className="space-y-4 flex-1">
                  <div>
                    <h3 className="font-medium">Equipment Summary</h3>
                    <p>Total equipment: 8 units (5 owned, 3 proposed)</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Simulation Results</h3>
                    <p>Throughput: 115 units/hr</p>
                    <p>Cycle Time: 33 seconds</p>
                    <p>Utilization: 75%</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Financial Summary</h3>
                    <p>Estimated Cost of Proposed Equipment: $100,000</p>
                    <p>Return on Investment: 18 months</p>
                  </div>
                </div>
                <div className="mt-auto text-center text-sm text-muted-foreground">
                  Generated on {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPDFDialog(false)}>
                Close
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Simulation;
