
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuctionCard from '@/components/AuctionCard';
import { getUserVehicles, getUserFavorites } from '@/services/vehicleService';
import { Auction } from '@/components/AuctionCard';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('vehicles');
  const { user, signOut } = useAuth();
  const [userVehicles, setUserVehicles] = useState<Auction[]>([]);
  const [userFavorites, setUserFavorites] = useState<Auction[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  
  // Añadir función para refrescar las subastas después de eliminar
  const refreshAuctions = async () => {
    setLoadingVehicles(true);
    const { vehicles } = await getUserVehicles();
    
    // Transform vehicle data to match Auction type
    const transformedVehicles = vehicles.map((vehicle: any) => {
      // For each vehicle, get the first auction or create default values
      const auction = vehicle.auctions && vehicle.auctions[0] ? vehicle.auctions[0] : {};
      
      return {
        id: vehicle.id,
        title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        description: vehicle.description || '',
        imageUrl: 'https://via.placeholder.com/400x300', // Default image or you could use a real image from vehicle
        currentBid: auction.start_price || 0,
        endTime: auction.end_date ? new Date(auction.end_date) : new Date(),
        bidCount: 0, // Default value
        status: auction.status || 'draft',
        auctionId: auction.id || vehicle.id, // Use auction ID if available, otherwise vehicle ID
      };
    });
    
    setUserVehicles(transformedVehicles);
    setLoadingVehicles(false);
  };

  useEffect(() => {
    const fetchUserVehicles = async () => {
      setLoadingVehicles(true);
      const { vehicles } = await getUserVehicles();
      
      // Transform vehicle data to match Auction type
      const transformedVehicles = vehicles.map((vehicle: any) => {
        // For each vehicle, get the first auction or create default values
        const auction = vehicle.auctions && vehicle.auctions[0] ? vehicle.auctions[0] : {};
        
        return {
          id: vehicle.id,
          title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
          description: vehicle.description || '',
          imageUrl: 'https://via.placeholder.com/400x300', // Default image or you could use a real image from vehicle
          currentBid: auction.start_price || 0,
          endTime: auction.end_date ? new Date(auction.end_date) : new Date(),
          bidCount: 0, // Default value
          status: auction.status || 'draft',
          auctionId: auction.id || vehicle.id, // Use auction ID if available, otherwise vehicle ID
        };
      });
      
      setUserVehicles(transformedVehicles);
      setLoadingVehicles(false);
    };

    const fetchUserFavorites = async () => {
      setLoadingFavorites(true);
      const { favorites } = await getUserFavorites();
      
      // Transform favorites data to match Auction type
      const transformedFavorites = favorites.map((favorite: any) => {
        const auction = favorite.auctions;
        const vehicle = auction?.vehicles || {};
        
        return {
          id: favorite.id,
          title: vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}` : 'Vehículo',
          description: vehicle?.description || 'Sin descripción',
          imageUrl: 'https://via.placeholder.com/400x300', // Default image
          currentBid: auction?.start_price || 0,
          endTime: auction?.end_date ? new Date(auction.end_date) : new Date(),
          bidCount: 0, // Default value
          status: auction?.status || 'unknown',
          auctionId: auction?.id, // Use auction ID for linking
        };
      });
      
      setUserFavorites(transformedFavorites);
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
