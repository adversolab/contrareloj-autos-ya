
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Share2, ArrowLeft, PlusCircle } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import { getAuctionById } from '@/services/vehicleService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [auctionData, setAuctionData] = useState<any>(null);
  const [vehiclePhotos, setVehiclePhotos] = useState<any[]>([]);
  const [vehicleFeatures, setVehicleFeatures] = useState<any[]>([]);

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      setIsLoading(true);
      if (!id) return;
      
      try {
        const { auction, error } = await getAuctionById(id);
        if (error) {
          toast.error("No se pudo cargar la información de la subasta");
          return;
        }
        
        if (auction) {
          setAuctionData(auction);
          if (auction.vehicles && auction.vehicles.vehicle_photos) {
            setVehiclePhotos(auction.vehicles.vehicle_photos.sort((a: any, b: any) => a.position - b.position));
          }
          
          if (auction.vehicles && auction.vehicles.vehicle_features) {
            setVehicleFeatures(auction.vehicles.vehicle_features);
          }
        }
      } catch (error) {
        console.error("Error fetching auction details:", error);
        toast.error("Error al cargar los detalles de la subasta");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuctionDetails();
  }, [id]);

  const handleBid = () => {
    toast('Esta funcionalidad será implementada próximamente', {
      description: 'La posibilidad de ofertar está en desarrollo',
    });
  };

  // Group features by category
  const featuresByCategory = vehicleFeatures?.reduce((acc: any, feature: any) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature.feature);
    return acc;
  }, {});

  const handleFavoriteClick = () => {
    toast('Añadido a favoritos');
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('Enlace copiado al portapapeles');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Cargando detalles de la subasta...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!auctionData || !auctionData.vehicles) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Subasta no encontrada</h1>
            <p className="mb-6">La subasta que buscas no existe o ha sido eliminada</p>
            <Button onClick={() => window.history.back()} className="bg-contrareloj hover:bg-contrareloj-dark">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const vehicle = auctionData.vehicles;
  const mainImageUrl = vehiclePhotos.length > 0 ? vehiclePhotos[activeImageIndex].url : 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Gallery Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
            <div className="lg:col-span-3">
              <div className="relative h-96 md:h-[500px] overflow-hidden rounded-lg">
                <img 
                  src={mainImageUrl} 
                  alt={`${vehicle.brand} ${vehicle.model}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnails */}
              {vehiclePhotos.length > 1 && (
                <div className="mt-4 flex overflow-x-auto space-x-2 pb-2">
                  {vehiclePhotos.map((photo, index) => (
                    <button 
                      key={photo.id} 
                      className={`flex-shrink-0 w-24 h-20 rounded-md overflow-hidden ${activeImageIndex === index ? 'ring-2 ring-contrareloj' : ''}`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img src={photo.url} alt={`Thumbnail ${index+1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Auction Details */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <div className="mb-4">
                <p className="text-gray-500 uppercase text-xs font-medium">OFERTA ACTUAL</p>
                <h2 className="text-3xl font-bold">${auctionData.start_price?.toLocaleString('es-CL')}</h2>
                <p className="text-sm text-gray-500">{0} ofertas</p>
              </div>
              
              <div className="mb-6">
                <CountdownTimer 
                  endTime={auctionData.end_date ? new Date(auctionData.end_date) : new Date()} 
                  detailed={true}
                />
              </div>
              
              {user && (
                <>
                  <div className="mb-6">
                    <p className="mb-1 text-sm font-medium">Tu oferta (CLP)</p>
                    <div className="flex space-x-2">
                      <Input 
                        type="text"
                        value={bidAmount} 
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Mín ${(auctionData.start_price + auctionData.min_increment).toLocaleString('es-CL')}`}
                        className="flex-grow"
                      />
                      <Button 
                        className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                        onClick={handleBid}
                      >
                        Ofertar
                      </Button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Incremento mínimo: ${auctionData.min_increment?.toLocaleString('es-CL')}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium mb-2">Importante:</h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start">
                        <PlusCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <span>Al ofertar te comprometes a completar la compra si ganas.</span>
                      </li>
                      <li className="flex items-start">
                        <PlusCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <span>Se aplica un 5% de comisión sobre el monto final.</span>
                      </li>
                      <li className="flex items-start">
                        <PlusCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <span>El reloj se extenderá 2 minutos si hay ofertas en el último minuto.</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleFavoriteClick}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleShareClick}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
              </div>
            </div>
          </div>
          
          {/* Vehicle Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model} {vehicle.year}</h1>
            <p className="text-gray-600 mb-6">{vehicle.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Año</p>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Kilómetros</p>
                <p className="font-medium">{vehicle.kilometers?.toLocaleString()} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Motor</p>
                <p className="font-medium">{vehicle.fuel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Transmisión</p>
                <p className="font-medium">{vehicle.transmission}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Combustible</p>
                <p className="font-medium">{vehicle.fuel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Ubicación</p>
                <p className="font-medium">Chile</p>
              </div>
            </div>
          </div>
          
          {/* Tabs Section */}
          <Tabs defaultValue="details" className="mb-8">
            <TabsList className="w-full border-b">
              <TabsTrigger value="details" className="flex-1">Detalles</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">Historial</TabsTrigger>
              <TabsTrigger value="questions" className="flex-1">Preguntas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="pt-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Características</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
                  {Object.entries(featuresByCategory || {}).map(([category, features]: [string, any]) => (
                    <div key={category}>
                      <h4 className="font-medium mb-2">{category}</h4>
                      <ul className="space-y-3">
                        {features.map((feature: string, i: number) => (
                          <li key={i} className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-contrareloj mr-3"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Especificaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Año</span>
                    <span>{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Kilometraje</span>
                    <span>{vehicle.kilometers?.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Motor</span>
                    <span>{vehicle.fuel}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Transmisión</span>
                    <span>{vehicle.transmission}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Combustible</span>
                    <span>{vehicle.fuel}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Ubicación</span>
                    <span>Chile</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="pt-6">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">Historial de ofertas</h3>
                <p className="text-gray-500">Aún no hay ofertas para este vehículo.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="questions" className="pt-6">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">Preguntas y respuestas</h3>
                <p className="text-gray-500">Todavía no hay preguntas.</p>
                <Button className="mt-4 bg-contrareloj hover:bg-contrareloj-dark">
                  Hacer una pregunta
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

export default AuctionDetail;
