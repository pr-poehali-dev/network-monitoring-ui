
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ConnectionGuard from "./components/ConnectionGuard";
import Index from "./pages/Index";
import Station from "./pages/Station";
import Statistics from "./pages/Statistics";
import Monitoring from "./pages/Monitoring";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ConnectionGuard>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/station/:id" element={<Station />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ConnectionGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;