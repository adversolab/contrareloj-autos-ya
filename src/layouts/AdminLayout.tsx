
import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  // Protect admin routes
  useEffect(() => {
    if (!isLoading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        
        <Tabs defaultValue={currentPath} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="dashboard"
              asChild
            >
              <Link to="/admin">Dashboard</Link>
            </TabsTrigger>
            <TabsTrigger
              value="usuarios"
              asChild
            >
              <Link to="/admin/usuarios">Users</Link>
            </TabsTrigger>
            <TabsTrigger
              value="vehiculos"
              asChild
            >
              <Link to="/admin/vehiculos">Vehicles</Link>
            </TabsTrigger>
            <TabsTrigger
              value="subastas"
              asChild
            >
              <Link to="/admin/subastas">Auctions</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
