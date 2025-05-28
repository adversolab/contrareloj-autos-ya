
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, Clock, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const NewHero = () => {
  const [stats, setStats] = useState({
    activeAuctions: 324,
    totalVehicles: 2410,
    registeredUsers: 6920
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: activeAuctions } = await supabase
          .from('auctions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        const { count: totalVehicles } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true });

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          El tiempo corre.<br />
          <span className="text-contrareloj">Súmate a las subastas</span><br />
          que mueven el motor de Chile
        </h1>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link to="/explorar">
            <Button 
              size="lg" 
              className="bg-contrareloj hover:bg-contrareloj-dark text-white px-12 py-6 text-xl font-semibold shadow-2xl transform hover:scale-105 transition-all"
            >
              Explorar autos
            </Button>
          </Link>
          <Link to="/vender">
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-black px-12 py-6 text-xl font-semibold shadow-2xl transform hover:scale-105 transition-all"
            >
              Publicar vehículo
            </Button>
          </Link>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-contrareloj p-4 rounded-full">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold">{stats.activeAuctions.toLocaleString()}</div>
              <div className="text-white/80">Subastas activas</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <div className="bg-contrareloj p-4 rounded-full">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold">{stats.totalVehicles.toLocaleString()}</div>
              <div className="text-white/80">Autos publicados</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <div className="bg-contrareloj p-4 rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold">{stats.registeredUsers.toLocaleString()}</div>
              <div className="text-white/80">Usuarios registrados</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHero;
