import React, { useState, createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
type SidebarContextType = {
  collapsed: boolean;
  toggleCollapse: () => void;
};
const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleCollapse: () => {}
});
export const useSidebar = () => useContext(SidebarContext);
interface SidebarProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}
export function SidebarProvider({
  children,
  defaultCollapsed = false
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  return <SidebarContext.Provider value={{
    collapsed,
    toggleCollapse
  }}>
      {children}
    </SidebarContext.Provider>;
}
interface SidebarProps {
  children: ReactNode;
  className?: string;
}
export function Sidebar({
  children,
  className
}: SidebarProps) {
  const {
    collapsed
  } = useSidebar();
  return <aside className={cn("h-screen overflow-y-auto border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out", collapsed ? "w-16" : "w-64", className)}>
      {children}
    </aside>;
}
interface SidebarHeaderProps {
  children?: ReactNode;
  className?: string;
}
export function SidebarHeader({
  children,
  className
}: SidebarHeaderProps) {
  return <div className={cn("flex h-14 items-center justify-between border-b border-sidebar-border px-4", className)}>
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
  const {
    collapsed
  } = useSidebar();
  return <div className={cn("py-3", className)}>
      {title}
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
  const {
    collapsed
  } = useSidebar();
  return <button onClick={onClick} className={cn("sidebar-item w-full", active ? "sidebar-item-active" : "sidebar-item-inactive", className)}>
      <Icon size={18} />
      {!collapsed && <span>{children}</span>}
    </button>;
}
interface SidebarTriggerProps {
  className?: string;
}
export function SidebarTrigger({
  className
}: SidebarTriggerProps) {
  const {
    collapsed,
    toggleCollapse
  } = useSidebar();
  return <Button variant="ghost" size="icon" onClick={toggleCollapse} className={cn("fixed left-4 top-4 z-50", className)}>
      {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
    </Button>;
}
interface SidebarFooterProps {
  children?: ReactNode;
  className?: string;
}
export function SidebarFooter({
  children,
  className
}: SidebarFooterProps) {
  return <div className={cn("mt-auto border-t border-sidebar-border p-4", className)}>
      {children}
    </div>;
}