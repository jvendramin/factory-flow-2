
import { Equipment } from "@/types/equipment";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard = ({ equipment }: EquipmentCardProps) => {
  const onDragStart = (event: React.DragEvent, equipment: Equipment) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(equipment));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      className="cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors"
      draggable
      onDragStart={(e) => onDragStart(e, equipment)}
    >
      <CardContent className="p-3">
        <div className="flex flex-col gap-1">
          <div className="font-medium">{equipment.name}</div>
          <Badge variant="outline" className="w-fit">
            {equipment.type}
          </Badge>
          
          <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <div>
              <span>Cycle Time: </span>
              <span className="font-medium text-foreground">{equipment.cycleTime}s</span>
            </div>
            <div>
              <span>Throughput: </span>
              <span className="font-medium text-foreground">{equipment.throughput}/hr</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
