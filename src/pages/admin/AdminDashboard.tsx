
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
      console.log("Cargando estadísticas del dashboard...");
      
      // Obtener total de usuarios
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Usuarios pendientes de verificación
      // Modificado para incluir a usuarios que tienen rut o documentos subidos pero no están verificados
      const { data: pendingVerificationProfiles, error: pendingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('identity_verified', false)
        .or('rut.is.not.null,identity_document_url.is.not.null,identity_selfie_url.is.not.null');
        
      console.log("Query for pending verifications:", pendingVerificationProfiles);
      
      if (pendingError) {
        console.error("Error fetching pending verifications:", pendingError);
      }
      
      // Alternative approach to count pending verifications
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, identity_verified, rut, identity_document_url, identity_selfie_url');
      
      // Count users with any verification document but not yet verified
      const pendingVerifications = (allProfiles || []).filter(profile => 
        !profile.identity_verified && 
        (profile.rut || profile.identity_document_url || profile.identity_selfie_url)
      ).length;
      
      console.log("Usuarios pendientes de verificación (computed):", pendingVerifications);
      
      // Total de vehículos
      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });
      
      // Vehículos pendientes de aprobación
      const { count: pendingVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);
      
      // Total de subastas
      const { count: totalAuctions } = await supabase
        .from('auctions')
        .select('*', { count: 'exact', head: true });
      
      // Subastas pendientes de aprobación
      const { count: pendingAuctions } = await supabase
        .from('auctions')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);
      
      setStats({
        totalUsers: totalUsers || 0,
        totalVehicles: totalVehicles || 0,
        totalAuctions: totalAuctions || 0,
        pendingVerifications: pendingVerifications || 0,
        pendingVehicles: pendingVehicles || 0,
        pendingAuctions: pendingAuctions || 0,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
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
              Usuarios Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            {stats.pendingVerifications > 0 ? (
              <Link to="/admin/usuarios#pending-verifications" className="text-xs text-amber-500 font-semibold hover:underline">
                {stats.pendingVerifications} pendientes de verificación
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">
                {stats.pendingVerifications} pendientes de verificación
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Vehículos Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className={`text-xs ${stats.pendingVehicles > 0 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
              {stats.pendingVehicles} pendientes de aprobación
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Subastas Creadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAuctions}</div>
            <p className={`text-xs ${stats.pendingAuctions > 0 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
              {stats.pendingAuctions} pendientes de aprobación
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-md p-6 shadow">
        <h2 className="font-semibold text-lg mb-4">Actividad Reciente</h2>
        <p className="text-muted-foreground">
          Panel de administración implementado. Ahora puedes verificar usuarios, aprobar vehículos y subastas desde las pestañas correspondientes.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
