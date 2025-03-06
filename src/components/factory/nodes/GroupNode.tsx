
import { useCallback, useState, useRef, useEffect } from "react";
import { Handle, Position, NodeProps, useReactFlow } from "reactflow";
import { Input } from "@/components/ui/input";
import { Edit2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

type GroupNodeData = {
  label: string;
};

const GroupNode = ({ id, data, selected }: NodeProps<GroupNodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "Equipment Group");
  const { setNodes } = useReactFlow();
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

  // Define handle styles
  const handleStyle = {
    background: "#555",
    width: "8px",
    height: "8px",
    border: "1px solid #fff",
  };

  return (
    <>
      <div className="group-header">
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
              <Check size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center">
            <span className="text-xs font-medium">{label}</span>
            <button 
              onClick={handleEditClick}
              className="ml-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
      
      {/* Handles on all sides to allow connections to the group */}
      <Handle type="target" position={Position.Top} style={handleStyle} id="group-target-top" />
      <Handle type="source" position={Position.Top} style={handleStyle} id="group-source-top" />
      
      <Handle type="target" position={Position.Right} style={handleStyle} id="group-target-right" />
      <Handle type="source" position={Position.Right} style={handleStyle} id="group-source-right" />
      
      <Handle type="target" position={Position.Bottom} style={handleStyle} id="group-target-bottom" />
      <Handle type="source" position={Position.Bottom} style={handleStyle} id="group-source-bottom" />
      
      <Handle type="target" position={Position.Left} style={handleStyle} id="group-target-left" />
      <Handle type="source" position={Position.Left} style={handleStyle} id="group-source-left" />
    </>
  );
};

export default GroupNode;
