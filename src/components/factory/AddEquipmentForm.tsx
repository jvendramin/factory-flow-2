
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Equipment } from "@/types/equipment";
import { toast } from "@/components/ui/use-toast";
import { nanoid } from 'nanoid';

interface AddEquipmentFormProps {
  onEquipmentAdded: (equipment: Equipment) => void;
}

const AddEquipmentForm = ({ onEquipmentAdded }: AddEquipmentFormProps) => {
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    type: '',
    description: '',
    cycleTime: 60,
    throughput: 60,
    dimensions: { width: 150, height: 100 },
    maintenanceInterval: 168,
    setupTime: 30,
    energy: 10,
    maxCapacity: 1,
    ownership: 'owned'
  });

  const handleChange = (field: keyof Equipment, value: any) => {
    setNewEquipment(prev => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create complete equipment object with ID
    const completeEquipment: Equipment = {
      id: nanoid(),
      name: newEquipment.name || 'New Equipment',
      type: newEquipment.type || 'Generic',
      description: newEquipment.description || 'Description',
      cycleTime: newEquipment.cycleTime || 60,
      throughput: newEquipment.throughput || 60,
      dimensions: newEquipment.dimensions || { width: 150, height: 100 },
      maintenanceInterval: newEquipment.maintenanceInterval,
      setupTime: newEquipment.setupTime,
      energy: newEquipment.energy,
      maxCapacity: newEquipment.maxCapacity,
      ownership: newEquipment.ownership || 'owned'
    };
    
    onEquipmentAdded(completeEquipment);
    
    toast({
      title: "Equipment Added",
      description: `${completeEquipment.name} has been added to your equipment library.`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">Add New Equipment</h3>
        <p className="text-sm text-muted-foreground">Enter equipment specifications below</p>
      </div>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={newEquipment.name || ''}
            onChange={(e) => handleChange("name", e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="type" className="text-right">
            Type
          </Label>
          <Input
            id="type"
            value={newEquipment.type || ''}
            onChange={(e) => handleChange("type", e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input
            id="description"
            value={newEquipment.description || ''}
            onChange={(e) => handleChange("description", e.target.value)}
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
            value={newEquipment.cycleTime || ''}
            onChange={(e) => handleNumberChange("cycleTime", e.target.value)}
            className="col-span-3"
            required
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
            value={newEquipment.maxCapacity || 1}
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
            value={newEquipment.throughput || ''}
            onChange={(e) => handleNumberChange("throughput", e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="width" className="text-right">
            Width (px)
          </Label>
          <Input
            id="width"
            type="number"
            value={newEquipment.dimensions?.width || ''}
            onChange={(e) => handleDimensionChange("width", e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="height" className="text-right">
            Height (px)
          </Label>
          <Input
            id="height"
            type="number"
            value={newEquipment.dimensions?.height || ''}
            onChange={(e) => handleDimensionChange("height", e.target.value)}
            className="col-span-3"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="setupTime" className="text-right">
            Setup Time (min)
          </Label>
          <Input
            id="setupTime"
            type="number"
            value={newEquipment.setupTime || ''}
            onChange={(e) => handleNumberChange("setupTime", e.target.value)}
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="maintenanceInterval" className="text-right">
            Maintenance (hrs)
          </Label>
          <Input
            id="maintenanceInterval"
            type="number"
            value={newEquipment.maintenanceInterval || ''}
            onChange={(e) => handleNumberChange("maintenanceInterval", e.target.value)}
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="energy" className="text-right">
            Energy (kW)
          </Label>
          <Input
            id="energy"
            type="number"
            value={newEquipment.energy || ''}
            onChange={(e) => handleNumberChange("energy", e.target.value)}
            className="col-span-3"
          />
        </div>
        
        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right pt-2">
            Ownership
          </Label>
          <RadioGroup 
            value={newEquipment.ownership} 
            onValueChange={(value) => handleChange("ownership", value)}
            className="col-span-3 flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="owned" id="owned" />
              <Label htmlFor="owned" className="font-normal">Already Owned</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="proposed" id="proposed" />
              <Label htmlFor="proposed" className="font-normal">Proposed (Future Purchase)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => onEquipmentAdded(newEquipment as Equipment)}>
          Cancel
        </Button>
        <Button type="submit">
          Add Equipment
        </Button>
      </div>
    </form>
  );
};

export default AddEquipmentForm;
