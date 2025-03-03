
import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { equipmentLibrary } from "@/data/equipment";
import EquipmentCard from "./EquipmentCard";

const EquipmentPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredEquipment = equipmentLibrary.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-medium mb-2">Equipment</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 grid gap-2">
          {filteredEquipment.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EquipmentPanel;
