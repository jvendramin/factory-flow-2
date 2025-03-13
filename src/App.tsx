
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider } from "@/components/ui/collapsible-sidebar";
import AppLayout from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import Simulation from "./pages/Simulation";
import Financial from "./pages/Financial";
import Business from "./pages/Business";
import University from "./pages/University";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout><Home /></AppLayout>} />
              <Route path="/simulation" element={<AppLayout><Simulation /></AppLayout>} />
              <Route path="/financial" element={<AppLayout><Financial /></AppLayout>} />
              <Route path="/business" element={<AppLayout><Business /></AppLayout>} />
              <Route path="/university" element={<AppLayout><University /></AppLayout>} />
              <Route path="/marketplace" element={<AppLayout><Marketplace /></AppLayout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
