
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getFeaturedVehicles } from '@/services/highlightService';
import AuctionCard from './AuctionCard';

interface FeaturedVehicle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  featured: boolean;
}

const FeaturedVehiclesSection = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState<FeaturedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedVehicles = async () => {
      setIsLoading(true);
      const { vehicles } = await getFeaturedVehicles();
      setFeaturedVehicles(vehicles);
      setIsLoading(false);
    };

    loadFeaturedVehicles();
  }, []);

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-yellow-500 fill-current" />
          <h2 className="text-2xl font-bold">Vehículos Destacados</h2>
        </div>
        <div className="text-center py-8">
          <p>Cargando vehículos destacados...</p>
        </div>
      </section>
    );
  }

  if (featuredVehicles.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-yellow-50 to-orange-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-yellow-500 fill-current" />
          <h2 className="text-2xl font-bold">Vehículos Destacados</h2>
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            PREMIUM
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="relative">
              <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                DESTACADO
              </div>
              <AuctionCard
                id={vehicle.id}
                title={vehicle.title}
                description={vehicle.description}
                imageUrl={vehicle.imageUrl}
                currentBid={vehicle.currentBid}
                endTime={vehicle.endTime}
                bidCount={vehicle.bidCount}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVehiclesSection;
