
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Share } from 'lucide-react';

const AuctionDetail = () => {
  const { id } = useParams();
  const [currentBid, setCurrentBid] = useState(15990000);
  const [bidAmount, setBidAmount] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock data for a specific auction
  const auctionData = {
    id: parseInt(id || '1'),
    title: 'Kia Sportage 2.0 GSL 4x2',
    description: 'SUV moderno con gran espacio interior. Motor 2.0L, pantalla táctil, cámara de retroceso.',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      'https://images.unsplash.com/photo-1609873814058-a8928924184a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1746&q=80',
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
      'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
    ],
    currentBid: 15990000,
    bidCount: 10,
    endTime: new Date(Date.now() + 3 * 3600 * 1000 + 30 * 60 * 1000), // 3 hours 30 minutes from now
    minIncrement: 100000, // 100.000 CLP
    seller: 'Carlos Rodríguez',
    sellerRating: 4.8,
    sellerTransactions: 12,
    specs: {
      year: 2020,
      km: 45000,
      engine: '2.0L 4 cilindros',
      transmission: 'Automática',
      fuel: 'Gasolina',
      color: 'Gris Plata',
      doors: 5,
      location: 'Santiago, Chile',
    },
    features: [
      'Aire acondicionado', 
      'Alzavidrios eléctricos', 
      'Cierre centralizado',
      'Dirección asistida',
      'Frenos ABS',
      'Airbags frontales y laterales',
      'Control de estabilidad',
      'Bluetooth',
      'Cámara de retroceso',
      'Sensor de estacionamiento',
      'Pantalla táctil 8"',
      'Android Auto / Apple CarPlay'
    ],
    history: 'Vehículo de único dueño, mantenciones al día en concesionario oficial. Documentos al día, revisión técnica vigente hasta Octubre 2025.',
    questions: [
      { 
        user: 'Pedro Soto', 
        question: '¿El vehículo tiene algún detalle estético?',
        answer: 'Solo tiene un pequeño roce en el parachoques trasero, muy menor. Está documentado en las fotos de detalle.'
      },
      { 
        user: 'Ana Muñoz', 
        question: '¿Aceptas permutas por vehículo de menor valor?',
        answer: 'No, por el momento solo venta directa mediante la subasta.'
      },
      { 
        user: 'Jorge Hernández', 
        question: '¿Tiene alguna mantención pendiente?',
        answer: 'No, todas las mantenciones están al día según el programa del fabricante.'
      },
    ]
  };

  const handlePlaceBid = () => {
    const bidValue = parseInt(bidAmount.replace(/\D/g, ''));
    if (bidValue && bidValue >= currentBid + auctionData.minIncrement) {
      setCurrentBid(bidValue);
      setBidAmount('');
    } else {
      alert('La oferta debe ser al menos ' + Intl.NumberFormat('es-CL').format(currentBid + auctionData.minIncrement) + ' CLP.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Images and Info */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="relative overflow-hidden rounded-lg mb-3 bg-gray-100">
                <img
                  src={auctionData.images[selectedImageIndex]}
                  alt={auctionData.title}
                  className="w-full h-96 object-cover"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {auctionData.images.map((img, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer rounded-md overflow-hidden h-20 ${selectedImageIndex === index ? 'ring-2 ring-contrareloj' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-3">{auctionData.title}</h1>
              <p className="text-gray-600 mb-6">{auctionData.description}</p>
              
              <div className="flex flex-wrap gap-6">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Año</h3>
                  <p className="font-semibold">{auctionData.specs.year}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Kilómetros</h3>
                  <p className="font-semibold">{auctionData.specs.km.toLocaleString('es-CL')} km</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Motor</h3>
                  <p className="font-semibold">{auctionData.specs.engine}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Transmisión</h3>
                  <p className="font-semibold">{auctionData.specs.transmission}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Combustible</h3>
                  <p className="font-semibold">{auctionData.specs.fuel}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Ubicación</h3>
                  <p className="font-semibold">{auctionData.specs.location}</p>
                </div>
              </div>
            </div>
            
            <div>
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="history">Historial</TabsTrigger>
                  <TabsTrigger value="questions">Preguntas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="px-1">
                  <h3 className="font-semibold text-lg mb-3">Características</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 mb-6">
                    {auctionData.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-contrareloj mr-2"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-3">Especificaciones</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(auctionData.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">
                          {key === 'year' ? 'Año' :
                           key === 'km' ? 'Kilometraje' :
                           key === 'engine' ? 'Motor' :
                           key === 'transmission' ? 'Transmisión' :
                           key === 'fuel' ? 'Combustible' :
                           key === 'color' ? 'Color' :
                           key === 'doors' ? 'Puertas' :
                           key === 'location' ? 'Ubicación' : key}
                        </span>
                        <span className="font-semibold">
                          {key === 'km' ? `${value.toLocaleString('es-CL')} km` : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="font-semibold text-lg mb-3">Historia del vehículo</h3>
                    <p>{auctionData.history}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="questions">
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg mb-3">Preguntas y respuestas</h3>
                    
                    {auctionData.questions.map((q, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="mb-2">
                          <span className="font-medium">{q.user}</span>
                          <span className="text-gray-500 text-sm ml-2">preguntó:</span>
                        </div>
                        <p className="mb-3">{q.question}</p>
                        
                        <div className="pl-4 border-l-2 border-gray-200">
                          <div className="mb-2">
                            <span className="font-medium">{auctionData.seller}</span>
                            <span className="text-gray-500 text-sm ml-2">respondió:</span>
                          </div>
                          <p>{q.answer}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-8">
                      <h4 className="text-lg font-medium mb-3">Hacer una pregunta</h4>
                      <textarea 
                        className="w-full border border-gray-300 rounded-md p-3 h-24"
                        placeholder="Escribe tu pregunta para el vendedor..."
                      ></textarea>
                      <div className="mt-2 flex justify-end">
                        <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white">
                          Enviar pregunta
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Right Column - Bid Info */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm sticky top-20">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm text-gray-500">OFERTA ACTUAL</h3>
                  <p className="text-3xl font-bold">${currentBid.toLocaleString('es-CL')}</p>
                  <p className="text-sm text-gray-500">{auctionData.bidCount} ofertas</p>
                </div>
                
                <div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Share className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="mb-8">
                <CountdownTimer endTime={auctionData.endTime} />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Tu oferta (CLP)</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    className="border border-gray-300 rounded-md p-2 w-full"
                    placeholder={`Min ${(currentBid + auctionData.minIncrement).toLocaleString('es-CL')}`}
                    value={bidAmount}
                    onChange={(e) => {
                      // Format as currency while typing
                      const value = e.target.value.replace(/\D/g, '');
                      if (value) {
                        setBidAmount(Intl.NumberFormat('es-CL').format(parseInt(value)));
                      } else {
                        setBidAmount('');
                      }
                    }}
                  />
                  <Button 
                    className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                    onClick={handlePlaceBid}
                  >
                    Ofertar
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Incremento mínimo: ${auctionData.minIncrement.toLocaleString('es-CL')}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-medium mb-2">Importante:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Al ofertar te comprometes a completar la compra si ganas.</li>
                  <li>• Se aplica un 5% de comisión sobre el monto final.</li>
                  <li>• El reloj se extenderá 2 minutos si hay ofertas en el último minuto.</li>
                </ul>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-1">
                  <span className="font-medium">Vendedor:</span>
                  <span className="ml-2">{auctionData.seller}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Calificación: {auctionData.sellerRating}/5</span>
                  <span className="text-sm text-gray-500 ml-2">• {auctionData.sellerTransactions} transacciones</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuctionDetail;
