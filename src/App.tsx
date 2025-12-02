import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { defaultTheme } from "@/theme/config";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import StaffDashboard from "./pages/admin/StaffDashboard";
import StaffLogin from "./pages/admin/StaffLogin";
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
            {/* Customer-facing routes */}
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Menu />} />
            
            {/* Restaurant-specific menu routes with table number */}
            <Route path="/r/:restaurantSlug" element={<Index />} />
            <Route path="/r/:restaurantSlug/table/:tableNumber" element={<Index />} />
            
            {/* Staff dashboard - unified for all roles */}
            <Route path="/login" element={<StaffLogin />} />
            <Route path="/dashboard" element={<StaffDashboard />} />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/staff" element={<Navigate to="/dashboard" replace />} />
            <Route path="/kitchen" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
