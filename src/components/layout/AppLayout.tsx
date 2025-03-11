import React, { useState, useEffect } from "react";
import { Sidebar, SidebarHeader, SidebarSection, SidebarItem, SidebarFooter, useSidebar } from "@/components/ui/collapsible-sidebar";
import { LayoutGrid, Settings, Activity, Box, Shield, Code, Zap, CreditCard, Archive, SunMoon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/components/theme/theme-provider";
interface AppLayoutProps {
  children: React.ReactNode;
}
const AppLayout: React.FC<AppLayoutProps> = ({
  children
}) => {
  const location = useLocation();
  const {
    theme,
    setTheme
  } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Add hover delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(!isHovered);
    }, isHovered ? 100 : 400);
    return () => clearTimeout(timer);
  }, [isHovered]);
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  return <div className="flex h-screen w-full overflow-hidden bg-sidebar" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Sidebar collapsed={isCollapsed}>
        <SidebarHeader>
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <Box size={20} className="text-primary" />
            </div>
            <span className="ml-2 font-semibold text-sidebar-foreground">Factory Flow</span>
          </div>
        </SidebarHeader>
        
        <div className="flex flex-col h-[calc(100%-8rem)] overflow-hidden ml-2">
          <SidebarSection title="GENERAL">
            <SidebarItem icon={LayoutGrid} active={location.pathname === "/"}>
              Dashboard
            </SidebarItem>
            <SidebarItem icon={Activity}>Transactions</SidebarItem>
            <SidebarItem icon={Activity}>Metrics</SidebarItem>
            <SidebarItem icon={Shield}>Security</SidebarItem>
            <SidebarItem icon={Code}>API</SidebarItem>
            <SidebarItem icon={Zap}>Quick Setup</SidebarItem>
            <SidebarItem icon={CreditCard}>Payment Links</SidebarItem>
            <SidebarItem icon={Archive}>Archive</SidebarItem>
          </SidebarSection>
        </div>
        
        <SidebarFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-xs font-medium">MB</span>
              </div>
              <span className="ml-2 text-sm font-medium">Mark Bannert</span>
            </div>
            <button onClick={toggleTheme} className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
              <SunMoon size={18} className="mr-1" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <main className="flex-1 bg-background rounded-l-3xl shadow-md overflow-hidden mt-4 ml-2 mb-4 border border-gray-300/20 dark:border-gray-600/20 mx-0 my-0 px-0 py-0">
        {children}
      </main>
    </div>;
};
export default AppLayout;