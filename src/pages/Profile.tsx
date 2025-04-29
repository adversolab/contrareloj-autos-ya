import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuctionCard from '@/components/AuctionCard';
import { getUserVehicles, getUserFavorites } from '@/services/vehicleService';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const { user, signOut } = useAuth();
  const [userVehicles, setUserVehicles] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  
  // Añadir función para refrescar las subastas después de eliminar
  const refreshAuctions = async () => {
    setLoadingVehicles(true);
    const { vehicles } = await getUserVehicles();
    setUserVehicles(vehicles);
    setLoadingVehicles(false);
  };

  useEffect(() => {
    const fetchUserVehicles = async () => {
      setLoadingVehicles(true);
      const { vehicles } = await getUserVehicles();
      setUserVehicles(vehicles);
      setLoadingVehicles(false);
    };

    const fetchUserFavorites = async () => {
      setLoadingFavorites(true);
      const { favorites } = await getUserFavorites();
      setUserFavorites(favorites);
      setLoadingFavorites(false);
    };

    fetchUserVehicles();
    fetchUserFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mi perfil</h1>
          <Button variant="outline" onClick={signOut}>
            Cerrar sesión
          </Button>
        </div>

        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="vehicles" onClick={() => setActiveTab('vehicles')}>Mis vehículos</TabsTrigger>
            <TabsTrigger value="favorites" onClick={() => setActiveTab('favorites')}>Favoritos</TabsTrigger>
          </TabsList>
          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Mis vehículos</h2>
              <Button asChild>
                <Link to="/vender">Publicar un vehículo</Link>
              </Button>
            </div>

            {loadingVehicles ? (
              <div className="text-center py-8">
                <p>Cargando vehículos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userVehicles.length > 0 ? (
                  userVehicles.map((vehicle) => (
                    <AuctionCard 
                      key={vehicle.id} 
                      auction={vehicle} 
                      onDeleted={refreshAuctions} // Añadir callback para refrescar después de eliminar
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p>No tienes vehículos registrados.</p>
                    <Button asChild className="mt-4">
                      <Link to="/vender">Publicar un vehículo</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="favorites" className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Mis favoritos</h2>
            {loadingFavorites ? (
              <div className="text-center py-8">
                <p>Cargando favoritos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFavorites.length > 0 ? (
                  userFavorites.map((favorite) => (
                    <AuctionCard key={favorite.id} auction={favorite} />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p>No tienes favoritos guardados.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
