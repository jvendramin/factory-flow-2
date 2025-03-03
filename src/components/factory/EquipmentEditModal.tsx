
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Equipment } from "@/types/equipment";
import { toast } from "@/components/ui/use-toast";

interface EquipmentEditModalProps {
  equipment: Equipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (equipment: Equipment) => void;
}

const EquipmentEditModal = ({ 
  equipment, 
  open, 
  onOpenChange,
  onSave
}: EquipmentEditModalProps) => {
  const [editedEquipment, setEditedEquipment] = React.useState<Equipment | null>(null);

  React.useEffect(() => {
    if (equipment) {
      setEditedEquipment({ ...equipment });
    }
  }, [equipment]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] backdrop-blur-sm bg-background/95">
        <DialogHeader>
          <DialogTitle>Edit Equipment Specifications</DialogTitle>
          <DialogDescription>
            Modify the properties of this equipment. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
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
          
          {editedEquipment.maxCapacity !== undefined && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxCapacity" className="text-right">
                Max Capacity
              </Label>
              <Input
                id="maxCapacity"
                type="number"
                value={editedEquipment.maxCapacity}
                onChange={(e) => handleNumberChange("maxCapacity", e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentEditModal;
