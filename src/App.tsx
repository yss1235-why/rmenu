import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { defaultTheme } from "@/theme/config";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Initialize Firebase (optional - only if configured)
import { initializeFirebase } from "@/lib/firebase";

// Try to initialize Firebase, but don't fail if not configured
try {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  };
  if (config.apiKey) {
    initializeFirebase();
  }
} catch (error) {
  console.log("Firebase not configured, running in demo mode");
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider initialTheme={defaultTheme}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Index />} />
            <Route path="/r/:restaurantSlug" element={<Index />} />
            <Route path="/r/:restaurantSlug/table/:tableNumber" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
