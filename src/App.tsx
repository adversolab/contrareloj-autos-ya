
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SellCarProvider } from "@/contexts/SellContext";
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
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <SellCarProvider>
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
                  <Route index element={<AdminDashboard />} />
                  <Route path="subastas" element={<AuctionsManagement />} />
                  <Route path="usuarios" element={<UsersManagement />} />
                  <Route path="vehiculos" element={<VehiclesManagement />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SellCarProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
