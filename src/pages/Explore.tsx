import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuctionCard from '@/components/AuctionCard';
import FilterSection from '@/components/FilterSection';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';

interface Auction {
  id: string | number;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
}

const Explore = () => {
  const [sortBy, setSortBy] = useState('endingSoon');
  const [showFilter, setShowFilter] = useState(false);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoading(true);
      try {
        // Get active auctions with vehicle details and photos
        const { data, error } = await supabase
          .from('auctions')
          .select(`
            id,
            start_price,
            reserve_price,
            start_date,
            end_date,
            status,
            vehicles (
              id,
              brand,
              model,
              year,
              description,
              vehicle_photos (
                url,
                is_primary
              )
            )
          `)
          .eq('status', 'active');

        if (error) {
          console.error('Error fetching auctions:', error);
          return;
        }

        if (data && data.length > 0) {
          // Process auction data for display
          const processedAuctions = data.map(auction => {
            const vehicle = auction.vehicles;
            const mainPhoto = vehicle?.vehicle_photos?.find((photo: any) => photo.is_primary) || 
                             (vehicle?.vehicle_photos?.length > 0 ? vehicle.vehicle_photos[0] : null);
            
            return {
              id: auction.id,
              title: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Vehículo',
              description: vehicle?.description || '',
              imageUrl: mainPhoto ? mainPhoto.url : 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
              currentBid: auction.start_price || 0,
              endTime: auction.end_date ? new Date(auction.end_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              bidCount: 0, // Default to 0 for now, can be updated with actual bid count in the future
            };
          });

          setAuctions(processedAuctions);
        }
      } catch (error) {
        console.error('Error in fetchAuctions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Sort the auctions based on the selected criteria
  const sortedAuctions = [...auctions].sort((a, b) => {
    if (sortBy === 'endingSoon') {
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    } else if (sortBy === 'priceHigh') {
      return b.currentBid - a.currentBid;
    } else if (sortBy === 'priceLow') {
      return a.currentBid - b.currentBid;
    } else if (sortBy === 'mostBids') {
      return b.bidCount - a.bidCount;
    }
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explorar Subastas</h1>
          <p className="text-gray-600">
            Encuentra el vehículo que estás buscando entre todas nuestras subastas activas.
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Ordenar por:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5"
              >
                <option value="endingSoon">Terminando pronto</option>
                <option value="priceHigh">Precio: mayor a menor</option>
                <option value="priceLow">Precio: menor a mayor</option>
                <option value="mostBids">Más ofertas</option>
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <Button 
                onClick={() => setShowFilter(!showFilter)}
                variant={showFilter ? "default" : "outline"}
                className={`w-full sm:w-auto ${showFilter ? 'bg-contrareloj hover:bg-contrareloj-dark' : ''}`}
              >
                {showFilter ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>
            </div>
          </div>
        </div>
        
        {showFilter && (
          <div className="mb-8">
            <FilterSection />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <p>Cargando subastas...</p>
          </div>
        ) : sortedAuctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAuctions.map((auction) => (
              <AuctionCard key={auction.id} {...auction} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-medium mb-2">No hay subastas activas</h3>
            <p className="text-gray-500 mb-6">
              Pronto tendremos más vehículos disponibles.
            </p>
          </div>
        )}
        
        {sortedAuctions.length > 6 && (
          <div className="mt-12 flex justify-center">
            <Button variant="outline" className="text-contrareloj border-contrareloj hover:bg-contrareloj hover:text-white">
              Cargar más
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Explore;
