
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AuctionCard from '@/components/AuctionCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Mock data for featured auctions
const featuredAuctions = [
  {
    id: "1",
    title: 'Toyota RAV4 2.5 Limited 4x4',
    description: 'SUV familiar en excelentes condiciones. Motor 2.5L, 4x4, equipamiento full.',
    imageUrl: 'https://images.unsplash.com/photo-1568844293986-ca4c579100f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 18500000,
    endTime: new Date(Date.now() + 14 * 3600 * 1000), // 14 hours from now
    bidCount: 8,
    status: 'active',
    auctionId: "1"
  },
  {
    id: "2",
    title: 'Ford F-150 Lariat 3.5 Ecoboost',
    description: 'Camioneta potente y espaciosa. Motor 3.5L Ecoboost, cuero, cámara retroceso.',
    imageUrl: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 22450000,
    endTime: new Date(Date.now() + 3 * 3600 * 1000), // 3 hours from now
    bidCount: 12,
    status: 'active',
    auctionId: "2"
  },
  {
    id: "3",
    title: 'Mazda 3 Sport 2.0 GT',
    description: 'Hatchback deportivo con bajo kilometraje. Motor 2.0L, interior premium.',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1734&q=80',
    currentBid: 12990000,
    endTime: new Date(Date.now() + 26 * 3600 * 1000), // 26 hours from now
    bidCount: 5,
    status: 'active',
    auctionId: "3"
  }
];

// Mock data for ending soon auctions
const endingSoonAuctions = [
  {
    id: "4",
    title: 'Hyundai Tucson New TL 2.0',
    description: 'SUV compacto ideal para ciudad y carretera. Motor 2.0L, excelente rendimiento.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    currentBid: 14250000,
    endTime: new Date(Date.now() + 55 * 60 * 1000), // 55 minutes from now
    bidCount: 18,
    status: 'active',
    auctionId: "4"
  },
  {
    id: "5",
    title: 'Nissan Versa Advance 1.6',
    description: 'Sedán económico y cómodo. Motor 1.6L, excelente rendimiento de combustible.',
    imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80',
    currentBid: 8500000,
    endTime: new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000), // 2 hours 15 minutes from now
    bidCount: 7,
    status: 'active',
    auctionId: "5"
  },
  {
    id: "6",
    title: 'Kia Sportage 2.0 GSL',
    description: 'SUV moderno con gran espacio interior. Motor 2.0L, pantalla táctil, cámara retroceso.',
    imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 15990000,
    endTime: new Date(Date.now() + 3 * 3600 * 1000 + 30 * 60 * 1000), // 3 hours 30 minutes from now
    bidCount: 10,
    status: 'active',
    auctionId: "6"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <Hero />
      
      <main className="flex-grow">
        {/* Featured Auctions */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Subastas Destacadas</h2>
            <Link to="/explorar">
              <Button variant="link" className="text-contrareloj">
                Ver todas
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>
        
        {/* Ending Soon */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Finalizando Pronto</h2>
            <Link to="/explorar?sort=endingSoon">
              <Button variant="link" className="text-contrareloj">
                Ver todas
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endingSoonAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        </section>
        
        {/* How It Works */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-contrareloj-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-contrareloj text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Explora</h3>
                <p className="text-gray-600">
                  Navega por nuestra selección de vehículos y encuentra el que se ajuste a tus necesidades.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-contrareloj-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-contrareloj text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Oferta</h3>
                <p className="text-gray-600">
                  Participa en la subasta realizando ofertas seguras antes de que finalice el tiempo.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-contrareloj-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-contrareloj text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Compra</h3>
                <p className="text-gray-600">
                  Si ganas la subasta, completa la compra y ¡disfruta de tu nuevo vehículo!
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/ayuda/como-funciona">
                <Button variant="outline" className="text-contrareloj border-contrareloj hover:bg-contrareloj hover:text-white">
                  Saber más
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-contrareloj py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">¿Tienes un auto para vender?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Véndelo de forma rápida, segura y al mejor precio con nuestras subastas.
            </p>
            <Link to="/vender">
              <Button className="bg-white text-contrareloj hover:bg-gray-100 text-lg px-8 py-6">
                Vende tu auto ahora
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
