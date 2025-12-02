import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { defaultTheme } from "@/theme/config";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import StaffDashboard from "./pages/admin/StaffDashboard";
import StaffLogin from "./pages/admin/StaffLogin";
import NotFound from "./pages/NotFound";

// Initialize Firebase
import { initializeFirebase } from "@/lib/firebase";

// Initialize Firebase on app load
try {
  initializeFirebase();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
              
              {/* Staff authentication */}
              <Route path="/login" element={<StaffLogin />} />
              
              {/* Staff dashboard - protected by auth check inside component */}
              <Route path="/dashboard" element={<StaffDashboard />} />
              
              {/* Legacy redirects */}
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
              <Route path="/staff" element={<Navigate to="/dashboard" replace />} />
              <Route path="/kitchen" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
