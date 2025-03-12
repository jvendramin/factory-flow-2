
import React, { useState, createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SidebarContextType = {
  collapsed: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false
});

export const useSidebar = () => useContext(SidebarContext);

// Add the SidebarProvider component that's missing
export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

interface SidebarProps {
  children: ReactNode;
  className?: string;
  collapsed?: boolean;
}

export function Sidebar({
  children,
  className,
  collapsed = false
}: SidebarProps) {
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside className={cn(
        "h-screen transition-all duration-300 ease-in-out z-10 flex flex-col", 
        collapsed ? "w-16" : "w-64", 
        className
      )}>
        {children}
      </aside>
    </SidebarContext.Provider>
  );
}

interface SidebarHeaderProps {
  children?: ReactNode;
  className?: string;
}

export function SidebarHeader({
  children,
  className
}: SidebarHeaderProps) {
  const { collapsed } = useSidebar();
  
  return <div className={cn(
    "flex h-14 items-center transition-all duration-300", 
    collapsed ? "justify-center" : "justify-between px-4", 
    className
  )}>
    {children}
  </div>;
}

interface SidebarSectionProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function SidebarSection({
  children,
  title,
  className
}: SidebarSectionProps) {
  const { collapsed } = useSidebar();
  
  return <div className={cn("py-3", className)}>
    {title && !collapsed && <div className="px-4 text-xs font-semibold text-sidebar-foreground/50 mb-2">{title}</div>}
    <div className="space-y-1">{children}</div>
  </div>;
}

interface SidebarItemProps {
  icon: React.ElementType;
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SidebarItem({
  icon: Icon,
  children,
  active = false,
  onClick,
  className
}: SidebarItemProps) {
  const { collapsed } = useSidebar();
  
  return <button onClick={onClick} className={cn(
    "sidebar-item w-full transition-all duration-300", 
    active ? "sidebar-item-active" : "sidebar-item-inactive",
    collapsed ? "justify-center px-0" : "px-4",
    className
  )}>
    <Icon size={18} />
    {!collapsed && <span className="ml-2 transition-opacity duration-300">{children}</span>}
  </button>;
}

interface SidebarTriggerProps {
  className?: string;
}

export function SidebarTrigger({
  className
}: SidebarTriggerProps) {
  return null; // Remove the trigger button
}

interface SidebarFooterProps {
  children?: ReactNode;
  className?: string;
}

export function SidebarFooter({
  children,
  className
}: SidebarFooterProps) {
  const { collapsed } = useSidebar();
  
  return <div className={cn(
    "mt-auto transition-all duration-300", 
    collapsed ? "p-2 flex justify-center" : "p-4", 
    className
  )}>
    {children}
  </div>;
}

// Add Box component to be used in collapsed state
function Box({ size = 24, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
    </svg>
  );
}
