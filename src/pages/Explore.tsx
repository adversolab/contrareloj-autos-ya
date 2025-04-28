
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuctionCard from '@/components/AuctionCard';
import FilterSection from '@/components/FilterSection';
import { Button } from '@/components/ui/button';

// Mock data for auctions
const auctions = [
  {
    id: 1,
    title: 'Toyota RAV4 2.5 Limited 4x4',
    description: 'SUV familiar en excelentes condiciones. Motor 2.5L, 4x4, equipamiento full.',
    imageUrl: 'https://images.unsplash.com/photo-1568844293986-ca4c579100f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 18500000,
    endTime: new Date(Date.now() + 14 * 3600 * 1000), // 14 hours from now
    bidCount: 8,
  },
  {
    id: 2,
    title: 'Ford F-150 Lariat 3.5 Ecoboost',
    description: 'Camioneta potente y espaciosa. Motor 3.5L Ecoboost, cuero, cámara retroceso.',
    imageUrl: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 22450000,
    endTime: new Date(Date.now() + 3 * 3600 * 1000), // 3 hours from now
    bidCount: 12,
  },
  {
    id: 3,
    title: 'Mazda 3 Sport 2.0 GT',
    description: 'Hatchback deportivo con bajo kilometraje. Motor 2.0L, interior premium.',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1734&q=80',
    currentBid: 12990000,
    endTime: new Date(Date.now() + 26 * 3600 * 1000), // 26 hours from now
    bidCount: 5,
  },
  {
    id: 4,
    title: 'Hyundai Tucson New TL 2.0',
    description: 'SUV compacto ideal para ciudad y carretera. Motor 2.0L, excelente rendimiento.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    currentBid: 14250000,
    endTime: new Date(Date.now() + 55 * 60 * 1000), // 55 minutes from now
    bidCount: 18,
  },
  {
    id: 5,
    title: 'Nissan Versa Advance 1.6',
    description: 'Sedán económico y cómodo. Motor 1.6L, excelente rendimiento de combustible.',
    imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80',
    currentBid: 8500000,
    endTime: new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000), // 2 hours 15 minutes from now
    bidCount: 7,
  },
  {
    id: 6,
    title: 'Kia Sportage 2.0 GSL',
    description: 'SUV moderno con gran espacio interior. Motor 2.0L, pantalla táctil, cámara retroceso.',
    imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 15990000,
    endTime: new Date(Date.now() + 3 * 3600 * 1000 + 30 * 60 * 1000), // 3 hours 30 minutes from now
    bidCount: 10,
  },
  {
    id: 7,
    title: 'Chevrolet Onix LTZ 1.4',
    description: 'Compacto urbano con gran equipamiento. Motor 1.4L, pantalla táctil, Android Auto/Apple CarPlay.',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    currentBid: 7990000,
    endTime: new Date(Date.now() + 12 * 3600 * 1000), // 12 hours from now
    bidCount: 3,
  },
  {
    id: 8,
    title: 'Subaru XV 2.0i AWD',
    description: 'Crossover con tracción integral permanente. Motor 2.0L, alto despeje.',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 16490000,
    endTime: new Date(Date.now() + 5 * 24 * 3600 * 1000), // 5 days from now
    bidCount: 2,
  },
  {
    id: 9,
    title: 'Honda Civic Si',
    description: 'Sedán deportivo con motor turbo. Excelentes prestaciones y manejo deportivo.',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 17990000,
    endTime: new Date(Date.now() + 2 * 24 * 3600 * 1000), // 2 days from now
    bidCount: 6,
  }
];

const Explore = () => {
  const [sortBy, setSortBy] = useState('endingSoon');
  const [showFilter, setShowFilter] = useState(false);

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAuctions.map((auction) => (
            <AuctionCard key={auction.id} {...auction} />
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <Button variant="outline" className="text-contrareloj border-contrareloj hover:bg-contrareloj hover:text-white">
            Cargar más
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Explore;
