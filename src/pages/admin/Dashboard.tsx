
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Car, CreditCard, Trophy, AlertTriangle, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface DashboardStats {
  newUsers: number;
  activeAuctions: number;
  featuredVehicles: number;
  totalCredits: number;
  pendingReports: number;
  averageRating: number;
}

interface CreditMovement {
  fecha: string;
  compras: number;
  ajustes: number;
  bonos: number;
  correcciones: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    newUsers: 0,
    activeAuctions: 0,
    featuredVehicles: 0,
    totalCredits: 0,
    pendingReports: 0,
    averageRating: 0
  });
  const [creditData, setCreditData] = useState<CreditMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Primero, actualizar subastas expiradas
      await updateExpiredAuctions();

      // Usuarios nuevos en últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: newUsersData } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Subastas activas (solo las que realmente están activas y no han expirado)
      const now = new Date().toISOString();
      const { data: activeAuctionsData } = await supabase
        .from('auctions')
        .select('id')
        .eq('status', 'active')
        .eq('is_approved', true)
        .gte('end_date', now);

      // Vehículos destacados
      const { data: featuredVehiclesData } = await supabase
        .from('vehicles')
        .select('id')
        .eq('destacado', true);

      // Total de créditos en el sistema
      const { data: totalCreditsData } = await supabase
        .from('profiles')
        .select('saldo_creditos');

      // Reportes pendientes
      const { data: pendingReportsData } = await supabase
        .from('reportes')
        .select('id')
        .eq('estado', 'pendiente');

      // Promedio de valoraciones
      const { data: ratingsData } = await supabase
        .from('valoraciones_usuario')
        .select('puntuacion')
        .eq('visible', true);

      // Datos de créditos por mes (últimos 6 meses) - MEJORADO
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: creditMovementsData } = await supabase
        .from('movimientos_credito')
        .select('fecha, cantidad, tipo')
        .in('tipo', ['compra', 'ajuste', 'bono', 'correccion'])
        .gte('fecha', sixMonthsAgo.toISOString());

      // Procesar datos
      const totalCredits = totalCreditsData?.reduce((sum, user) => sum + (user.saldo_creditos || 0), 0) || 0;
      const averageRating = ratingsData?.length ? 
        ratingsData.reduce((sum, rating) => sum + rating.puntuacion, 0) / ratingsData.length : 0;

      // Agrupar movimientos de créditos por mes y tipo - MEJORADO
      const creditsByMonthAndType = creditMovementsData?.reduce((acc: Record<string, any>, movement) => {
        const month = new Date(movement.fecha).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { fecha: month, compras: 0, ajustes: 0, bonos: 0, correcciones: 0 };
        }
        
        switch (movement.tipo) {
          case 'compra':
            acc[month].compras += movement.cantidad;
            break;
          case 'ajuste':
            acc[month].ajustes += movement.cantidad;
            break;
          case 'bono':
            acc[month].bonos += movement.cantidad;
            break;
          case 'correccion':
            acc[month].correcciones += movement.cantidad;
            break;
        }
        return acc;
      }, {}) || {};

      const creditChartData = Object.values(creditsByMonthAndType)
        .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

      setStats({
        newUsers: newUsersData?.length || 0,
        activeAuctions: activeAuctionsData?.length || 0,
        featuredVehicles: featuredVehiclesData?.length || 0,
        totalCredits,
        pendingReports: pendingReportsData?.length || 0,
        averageRating
      });

      setCreditData(creditChartData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para actualizar subastas expiradas
  const updateExpiredAuctions = async () => {
    try {
      const now = new Date().toISOString();
      
      // Actualizar subastas que están marcadas como activas pero ya expiraron
      const { error } = await supabase
        .from('auctions')
        .update({ status: 'finished' })
        .eq('status', 'active')
        .lt('end_date', now);

      if (error) {
        console.error('Error updating expired auctions:', error);
      } else {
        console.log('Expired auctions updated successfully');
      }
    } catch (error) {
      console.error('Error in updateExpiredAuctions:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="text-center py-8">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Nuevos (7 días)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subastas Activas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAuctions}</div>
            <p className="text-xs text-muted-foreground">
              Solo subastas no expiradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehículos Destacados</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reportes Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valoración Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Chart - MEJORADO */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos de Créditos por Tipo (Últimos 6 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creditData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="compras" stackId="a" fill="#10b981" name="Compras" />
                <Bar dataKey="ajustes" stackId="a" fill="#f59e0b" name="Ajustes Admin" />
                <Bar dataKey="bonos" stackId="a" fill="#8b5cf6" name="Bonos" />
                <Bar dataKey="correcciones" stackId="a" fill="#06b6d4" name="Correcciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
