
import { useState } from "react";
import { Equipment } from "@/types/equipment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EquipmentEditModal from "./EquipmentEditModal";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface EquipmentCardProps {
  equipment: Equipment;
  onEquipmentUpdated?: (equipment: Equipment) => void;
}

const EquipmentCard = ({
  equipment,
  onEquipmentUpdated
}: EquipmentCardProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState<Equipment>(equipment);
  
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, equipment: Equipment) => {
    // Stringify the equipment object and set it as the drag data
    const equipmentJson = JSON.stringify(equipment);
    event.dataTransfer.setData('application/reactflow', equipmentJson);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const handleSaveEquipment = (updatedEquipment: Equipment) => {
    setCurrentEquipment(updatedEquipment);
    if (onEquipmentUpdated) {
      onEquipmentUpdated(updatedEquipment);
    }
  };
  
  const handleEditClick = () => {
    setShowEditModal(true);
  };
  
  return (
    <>
      <Card 
        className="cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors" 
        draggable 
        onDragStart={(e) => onDragStart(e, currentEquipment)}
      >
        <CardContent className="p-3">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-start">
              <div className="font-medium">{currentEquipment.name}</div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEditClick}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Specifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Badge variant="outline" className="w-fit">
              {currentEquipment.type}
            </Badge>
            
            <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <div>
                <span>Cycle Time: </span>
                <span className="font-medium text-foreground">{currentEquipment.cycleTime}s</span>
              </div>
              <div>
                <span>Throughput: </span>
                <span className="font-medium text-foreground">{currentEquipment.throughput}/hr</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px]">
          <EquipmentEditModal 
            equipment={currentEquipment} 
            onSave={handleSaveEquipment} 
            onClose={() => setShowEditModal(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentCard;
