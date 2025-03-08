
import { useCallback, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from "reactflow";
import { Input } from "@/components/ui/input";
import { Edit2, Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type GroupNodeData = {
  label: string;
  nodes: string[];
};

const GroupNode = ({ id, data, selected }: NodeProps<GroupNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "Sub-Flow");
  const { setNodes, deleteElements } = useReactFlow();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleSaveClick = useCallback(() => {
    setIsEditing(false);
    setNodes((nodes) => 
      nodes.map(node => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label
            }
          };
        }
        return node;
      })
    );
  }, [id, label, setNodes]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveClick();
    }
  }, [handleSaveClick]);

  const handleDelete = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Release all child nodes from the group
    setNodes((nodes) => {
      const childNodes = nodes.filter(n => n.parentNode === id);
      
      // First, update all child nodes to remove parentNode
      const updatedNodes = nodes.map(node => {
        if (node.parentNode === id) {
          // Adjust position to be absolute
          const parentNode = nodes.find(n => n.id === id);
          return {
            ...node,
            parentNode: undefined,
            extent: undefined,
            position: {
              x: (parentNode?.position.x || 0) + node.position.x,
              y: (parentNode?.position.y || 0) + node.position.y
            }
          };
        }
        return node;
      });
      
      // Then filter out the group node itself
      return updatedNodes.filter(node => node.id !== id);
    });
  }, [id, setNodes]);

  // Define handle styles
  const handleStyle = {
    background: "#555",
    width: "8px",
    height: "8px",
    border: "1px solid #fff",
  };

  return (
    <div className="group-container">
      <NodeResizer
        minWidth={300}
        minHeight={200}
        isVisible={selected}
        lineClassName="border-blue-400"
        handleClassName="h-3 w-3 bg-white border border-blue-400"
      />
      
      <Card className="group-header-card">
        {isEditing ? (
          <div className="flex items-center">
            <Input
              ref={inputRef}
              value={label}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="h-6 py-0 px-2 text-xs w-40"
              autoFocus
            />
            <button 
              onClick={handleSaveClick}
              className="ml-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <span className="text-xs font-medium">{label}</span>
              <button 
                onClick={handleEditClick}
                className="ml-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit2 size={14} />
              </button>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-2" 
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Sub-Flow</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </Card>
      
      {/* Handles on all sides to allow connections to the group */}
      <Handle type="target" position={Position.Top} style={handleStyle} id="group-target-top" />
      <Handle type="source" position={Position.Top} style={handleStyle} id="group-source-top" />
      
      <Handle type="target" position={Position.Right} style={handleStyle} id="group-target-right" />
      <Handle type="source" position={Position.Right} style={handleStyle} id="group-source-right" />
      
      <Handle type="target" position={Position.Bottom} style={handleStyle} id="group-target-bottom" />
      <Handle type="source" position={Position.Bottom} style={handleStyle} id="group-source-bottom" />
      
      <Handle type="target" position={Position.Left} style={handleStyle} id="group-target-left" />
      <Handle type="source" position={Position.Left} style={handleStyle} id="group-source-left" />
    </div>
  );
};

export default GroupNode;
