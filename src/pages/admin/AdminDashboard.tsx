
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  totalAuctions: number;
  pendingVerifications: number;
  pendingVehicles: number;
  pendingAuctions: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVehicles: 0,
    totalAuctions: 0,
    pendingVerifications: 0,
    pendingVehicles: 0,
    pendingAuctions: 0,
  });

  const loadStats = async () => {
    try {
      console.log("Loading dashboard statistics...");
      
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get users with documents but not verified
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, identity_verified, rut, identity_document_url, identity_selfie_url')
        .eq('identity_verified', false);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      
      // Improved: use Boolean to ensure conversion to boolean
      const pendingVerifications = profiles?.filter(profile => 
        !profile.identity_verified && 
        (Boolean(profile.rut) || Boolean(profile.identity_document_url) || Boolean(profile.identity_selfie_url))
      ).length || 0;
      
      console.log("Profiles with verification status:", profiles?.map(p => ({
        id: p.id,
        verified: p.identity_verified,
        hasRut: Boolean(p.rut),
        hasDoc: Boolean(p.identity_document_url),
        hasSelfie: Boolean(p.identity_selfie_url)
      })));
      
      console.log("Total pending verification users:", pendingVerifications);
      
      // Total vehicles
      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });
      
      // Vehicles pending approval
      const { count: pendingVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);
      
      // Total auctions
      const { count: totalAuctions } = await supabase
        .from('auctions')
        .select('*', { count: 'exact', head: true });
      
      // Auctions pending approval
      const { count: pendingAuctions } = await supabase
        .from('auctions')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);
      
      setStats({
        totalUsers: totalUsers || 0,
        totalVehicles: totalVehicles || 0,
        totalAuctions: totalAuctions || 0,
        pendingVerifications: pendingVerifications,
        pendingVehicles: pendingVehicles || 0,
        pendingAuctions: pendingAuctions || 0,
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            {stats.pendingVerifications > 0 ? (
              <Link to="/admin/usuarios#pending-verifications" className="text-xs text-amber-500 font-semibold hover:underline">
                {stats.pendingVerifications} pending verification
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">
                {stats.pendingVerifications} pending verification
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className={`text-xs ${stats.pendingVehicles > 0 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
              {stats.pendingVehicles} pending approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Created Auctions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAuctions}</div>
            <p className={`text-xs ${stats.pendingAuctions > 0 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
              {stats.pendingAuctions} pending approval
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-md p-6 shadow">
        <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
        <p className="text-muted-foreground">
          Admin panel implemented. You can now verify users, approve vehicles and auctions from their respective tabs.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
