
import React from 'react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Equipment } from "@/types/equipment";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Package, Lightbulb } from "lucide-react";

interface EquipmentEditModalProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipment: Equipment) => void;
  trigger?: React.ReactNode;
}

const EquipmentEditModal = ({ 
  equipment, 
  open, 
  onOpenChange,
  onSave,
  trigger
}: EquipmentEditModalProps) => {
  const [editedEquipment, setEditedEquipment] = React.useState<Equipment | null>(null);

  React.useEffect(() => {
    if (equipment) {
      // Ensure maxCapacity has a default value of 1
      const equipmentWithDefaults = {
        ...equipment,
        maxCapacity: equipment.maxCapacity ?? 1,
        ownership: equipment.ownership || "owned" // Ensure ownership has a default
      };
      setEditedEquipment(equipmentWithDefaults);
    }
  }, [equipment, open]);

  if (!editedEquipment) return null;

  const handleChange = (field: keyof Equipment, value: any) => {
    setEditedEquipment(prev => {
      if (!prev) return prev;
      
      if (field === "dimensions") {
        return {
          ...prev,
          dimensions: {
            ...prev.dimensions,
            ...value
          }
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleNumberChange = (field: keyof Equipment, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleChange(field, numValue);
    }
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleChange("dimensions", { [dimension]: numValue });
    }
  };

  const handleSave = () => {
    if (editedEquipment) {
      onSave(editedEquipment);
      toast({
        title: "Equipment Updated",
        description: `${editedEquipment.name} specifications have been updated.`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent className="w-[450px] p-0 z-50" showArrow={false} align="center" side="right">
        <div className="p-4 border-b">
          <h3 className="font-medium">Edit Equipment Specifications</h3>
          <p className="text-sm text-muted-foreground">
            Modify the properties of this equipment. Click save when you're done.
          </p>
        </div>
        
        <ScrollArea className="max-h-[calc(100vh-300px)] min-h-[300px]">
          <div className="grid gap-4 p-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editedEquipment.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Input
                id="type"
                value={editedEquipment.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownership" className="text-right">
                Ownership
              </Label>
              <div className="col-span-3">
                <RadioGroup
                  value={editedEquipment.ownership || "owned"}
                  onValueChange={(value) => handleChange("ownership", value as "owned" | "proposed")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="owned" id="owned" />
                    <Label htmlFor="owned" className="flex items-center gap-1 cursor-pointer">
                      <Package size={14} /> Already Owned
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="proposed" id="proposed" />
                    <Label htmlFor="proposed" className="flex items-center gap-1 cursor-pointer">
                      <Lightbulb size={14} /> Proposed (Future Purchase)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cycleTime" className="text-right">
                Cycle Time (s)
              </Label>
              <Input
                id="cycleTime"
                type="number"
                value={editedEquipment.cycleTime}
                onChange={(e) => handleNumberChange("cycleTime", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxCapacity" className="text-right">
                Concurrent Units
              </Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                value={editedEquipment.maxCapacity || 1}
                onChange={(e) => handleNumberChange("maxCapacity", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="throughput" className="text-right">
                Throughput (units/hr)
              </Label>
              <Input
                id="throughput"
                type="number"
                value={editedEquipment.throughput}
                onChange={(e) => handleNumberChange("throughput", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="width" className="text-right">
                Width (px)
              </Label>
              <Input
                id="width"
                type="number"
                value={editedEquipment.dimensions.width}
                onChange={(e) => handleDimensionChange("width", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="height" className="text-right">
                Height (px)
              </Label>
              <Input
                id="height"
                type="number"
                value={editedEquipment.dimensions.height}
                onChange={(e) => handleDimensionChange("height", e.target.value)}
                className="col-span-3"
              />
            </div>
            
            {editedEquipment.setupTime !== undefined && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="setupTime" className="text-right">
                  Setup Time (min)
                </Label>
                <Input
                  id="setupTime"
                  type="number"
                  value={editedEquipment.setupTime}
                  onChange={(e) => handleNumberChange("setupTime", e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
            
            {editedEquipment.maintenanceInterval !== undefined && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maintenanceInterval" className="text-right">
                  Maintenance (hrs)
                </Label>
                <Input
                  id="maintenanceInterval"
                  type="number"
                  value={editedEquipment.maintenanceInterval}
                  onChange={(e) => handleNumberChange("maintenanceInterval", e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
            
            {editedEquipment.energy !== undefined && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="energy" className="text-right">
                  Energy (kW)
                </Label>
                <Input
                  id="energy"
                  type="number"
                  value={editedEquipment.energy}
                  onChange={(e) => handleNumberChange("energy", e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t flex justify-end">
          <Button type="button" variant="outline" className="mr-2" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save changes</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EquipmentEditModal;
