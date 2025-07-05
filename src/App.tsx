
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useAdminSetup } from "@/hooks/useAdminSetup";
import Index from "./pages/Index";
import CreateTask from "./pages/CreateTask";
import AdminRoles from "./pages/AdminRoles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle admin setup and show setup status
function AppWithSetup() {
  const { setupComplete, setupError } = useAdminSetup();

  // Log setup status for debugging and user feedback
  if (setupError) {
    console.warn('⚠️ Admin setup encountered an error:', setupError);
    // Don't block the app if admin setup fails, just log it
  }
  if (setupComplete) {
    console.log('✅ Default admin account is ready for login');
    console.log('🔐 Admin credentials: bensonandako26@gmail.com / 12345678');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/admin/roles" element={<AdminRoles />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppWithSetup />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
