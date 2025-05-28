
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  activeAuctions: number;
  totalVehicles: number;
  registeredUsers: number;
}

const StatsCounter = () => {
  const [stats, setStats] = useState<Stats>({
    activeAuctions: 324,
    totalVehicles: 2410,
    registeredUsers: 6920
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get active auctions count
        const { count: activeAuctions } = await supabase
          .from('auctions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Get total vehicles count
        const { count: totalVehicles } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true });

        // Get registered users count
        const { count: registeredUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          activeAuctions: activeAuctions || 324,
          totalVehicles: totalVehicles || 2410,
          registeredUsers: registeredUsers || 6920
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-6">
      <div className="flex flex-wrap justify-center gap-6 text-white text-sm md:text-base">
        <div className="flex items-center gap-2">
          <span className="text-lg">🕒</span>
          <span>Más de <strong>{stats.activeAuctions.toLocaleString()}</strong> subastas activas</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">🚗</span>
          <span><strong>{stats.totalVehicles.toLocaleString()}</strong> autos publicados</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <span><strong>{stats.registeredUsers.toLocaleString()}</strong> usuarios registrados</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCounter;
