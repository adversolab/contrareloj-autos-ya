
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuctionCard from '@/components/AuctionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Mock data for user's auctions
const biddingAuctions = [
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
    id: 4,
    title: 'Hyundai Tucson New TL 2.0',
    description: 'SUV compacto ideal para ciudad y carretera. Motor 2.0L, excelente rendimiento.',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    currentBid: 14250000,
    endTime: new Date(Date.now() + 55 * 60 * 1000), // 55 minutes from now
    bidCount: 18,
  },
];

const favoriteAuctions = [
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
    id: 6,
    title: 'Kia Sportage 2.0 GSL',
    description: 'SUV moderno con gran espacio interior. Motor 2.0L, pantalla táctil, cámara retroceso.',
    imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    currentBid: 15990000,
    endTime: new Date(Date.now() + 3 * 3600 * 1000 + 30 * 60 * 1000), // 3 hours 30 minutes from now
    bidCount: 10,
  },
];

const sellingAuctions = [
  {
    id: 5,
    title: 'Nissan Versa Advance 1.6',
    description: 'Sedán económico y cómodo. Motor 1.6L, excelente rendimiento de combustible.',
    imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80',
    currentBid: 8500000,
    endTime: new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000), // 2 hours 15 minutes from now
    bidCount: 7,
  },
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center text-2xl text-gray-600 mr-4">
                    JG
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Juan González</h1>
                    <p className="text-gray-500">Miembro desde Abril 2023</p>
                  </div>
                </div>
                
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  className={isEditing ? "bg-contrareloj hover:bg-contrareloj-dark" : ""}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Guardar cambios' : 'Editar perfil'}
                </Button>
              </div>
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre completo</label>
                    <input 
                      type="text" 
                      defaultValue="Juan González"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      defaultValue="juan.gonzalez@example.com"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <input 
                      type="text" 
                      defaultValue="+56 9 1234 5678"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Ciudad</label>
                    <input 
                      type="text" 
                      defaultValue="Santiago"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Cambiar contraseña</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="password" 
                        placeholder="Nueva contraseña"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                      <input 
                        type="password" 
                        placeholder="Confirmar contraseña"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Email</h2>
                    <p>juan.gonzalez@example.com</p>
                  </div>
                  
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Teléfono</h2>
                    <p>+56 9 1234 5678</p>
                  </div>
                  
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Ciudad</h2>
                    <p>Santiago</p>
                  </div>
                  
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Estadísticas</h2>
                    <p>5 compras • 3 ventas • 15 ofertas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="bidding" className="space-y-6">
            <TabsList className="w-full border-b">
              <TabsTrigger value="bidding" className="flex-1">Mis ofertas (2)</TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">Favoritos (2)</TabsTrigger>
              <TabsTrigger value="selling" className="flex-1">Mis ventas (1)</TabsTrigger>
              <TabsTrigger value="won" className="flex-1">Ganados (0)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bidding">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biddingAuctions.map((auction) => (
                  <AuctionCard key={auction.id} {...auction} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="favorites">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteAuctions.map((auction) => (
                  <AuctionCard key={auction.id} {...auction} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="selling">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sellingAuctions.map((auction) => (
                  <AuctionCard key={auction.id} {...auction} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="won">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Aún no has ganado ninguna subasta</h3>
                <p className="text-gray-500 mb-6">
                  Explora entre todas nuestras subastas y comienza a ofertar hoy mismo.
                </p>
                <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white">
                  Explorar subastas
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
