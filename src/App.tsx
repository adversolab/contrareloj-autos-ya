
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SellProvider } from "@/contexts/SellContext";
import AdminLayout from "@/layouts/AdminLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SellCar from "./pages/SellCar";
import Explore from "./pages/Explore";
import AuctionDetail from "./pages/AuctionDetail";
import Messages from "./pages/Messages";
import HelpCenter from "./pages/HelpCenter";
import BuyCredits from "./pages/BuyCredits";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AuctionsManagement from "./pages/admin/AuctionsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import VehiclesManagement from "./pages/admin/VehiclesManagement";
import Dashboard from "./pages/admin/Dashboard";
import ReportsManagement from "./pages/admin/ReportsManagement";
import RatingsManagement from "./pages/admin/RatingsManagement";
import CreditsManagement from "./pages/admin/CreditsManagement";
import MessagesManagement from "./pages/admin/MessagesManagement";
import TemplatesManagement from "./pages/admin/TemplatesManagement";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <SellProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/vender" element={<SellCar />} />
                <Route path="/explorar" element={<Explore />} />
                <Route path="/subasta/:id" element={<AuctionDetail />} />
                <Route path="/mensajes" element={<Messages />} />
                <Route path="/ayuda" element={<HelpCenter />} />
                <Route path="/comprar-creditos" element={<BuyCredits />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="subastas" element={<AuctionsManagement />} />
                  <Route path="usuarios" element={<UsersManagement />} />
                  <Route path="vehiculos" element={<VehiclesManagement />} />
                  <Route path="reportes" element={<ReportsManagement />} />
                  <Route path="valoraciones" element={<RatingsManagement />} />
                  <Route path="creditos" element={<CreditsManagement />} />
                  <Route path="mensajes" element={<MessagesManagement />} />
                  <Route path="plantillas" element={<TemplatesManagement />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SellProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
