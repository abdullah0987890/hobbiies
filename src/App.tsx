
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ServiceDetail from "./pages/ServiceDetail";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import PrivacyPolicy from "./components/Privacy";
import CustomerChat from "./components/customerDashboard/CustomerChat";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="provider">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                  path="/customerDashboard"
                  element={
                    <ProtectedRoute requiredRole="customer">
                      <CustomerChat />
                    </ProtectedRoute>
                  }
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
