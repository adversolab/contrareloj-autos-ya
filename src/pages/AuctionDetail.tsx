import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Share2, ArrowLeft, PlusCircle, MessageSquare, AlertCircle } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import QuestionList from '@/components/QuestionList';
import QuestionForm from '@/components/QuestionForm';
import AnswerDialog from '@/components/AnswerDialog';
import BidHistory from '@/components/BidHistory';
import BidConfirmationDialog from '@/components/BidConfirmationDialog';
import VerifyIdentityDialog from '@/components/VerifyIdentityDialog';
import { 
  getAuctionById, 
  isFavorite, 
  addToFavorites, 
  removeFromFavorites, 
  getAuctionQuestions,
  getAuctionBids,
  placeBid,
  finalizeAuction,
  getVerificationStatus
} from '@/services/vehicleService';
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
  const [isFavoriteAuction, setIsFavoriteAuction] = useState(false);
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [winner, setWinner] = useState<any>(null);

  // Add new useMemo for processing vehicle features by category
  const featuresByCategory = useMemo(() => {
    if (!vehicleFeatures || vehicleFeatures.length === 0) return {};
    
    // Group features by category
    const groupedFeatures = vehicleFeatures.reduce((acc: {[key: string]: string[]}, feature: any) => {
      const category = feature.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature.feature);
      return acc;
    }, {});
    
    return groupedFeatures;
  }, [vehicleFeatures]);

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

          // Verificar si el usuario es dueño de esta subasta
          if (user && auction.vehicles) {
            setIsOwner(user.id === auction.vehicles.user_id);
          }

          // Verificar si la subasta ha finalizado
          const endDate = new Date(auction.end_date || Date.now());
          const now = new Date();
          if (now > endDate || auction.status === 'finished') {
            setIsAuctionEnded(true);
            // Aquí podríamos buscar al ganador
            const highestBid = bids.length > 0 ? bids[0] : null;
            if (highestBid) {
              setWinner(highestBid);
            }
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
  }, [id, user]);

  // Verificar estado de verificación del usuario
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) return;
      
      const { isVerified } = await getVerificationStatus();
      setIsVerified(isVerified);
    };
    
    checkVerificationStatus();
  }, [user]);

  // Verificar si la subasta está en favoritos
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!id || !user) return;
      
      const { isFavorite: isFav } = await isFavorite(id);
      setIsFavoriteAuction(isFav);
    };
    
    checkFavoriteStatus();
  }, [id, user]);

  // Cargar preguntas
  useEffect(() => {
    const loadQuestions = async () => {
      if (!id) return;
      
      setIsLoadingQuestions(true);
      try {
        const { questions: questionData, error } = await getAuctionQuestions(id);
        if (!error) {
          setQuestions(questionData || []);
        }
      } catch (error) {
        console.error("Error al cargar preguntas:", error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    loadQuestions();
  }, [id]);

  // Cargar historial de ofertas
  useEffect(() => {
    const loadBidHistory = async () => {
      if (!id) return;
      
      setIsLoadingBids(true);
      try {
        const { bids: bidData, error } = await getAuctionBids(id);
        if (!error) {
          setBids(bidData || []);
          
          // Si la subasta ha terminado, identificar al ganador
          if (isAuctionEnded && bidData && bidData.length > 0) {
            setWinner(bidData[0]);
          }
        }
      } catch (error) {
        console.error("Error al cargar ofertas:", error);
      } finally {
        setIsLoadingBids(false);
      }
    };
    
    loadBidHistory();
  }, [id, isAuctionEnded]);

  // Verificador de tiempo para finalización automática
  useEffect(() => {
    if (!auctionData || !auctionData.end_date) return;
    
    const checkEndTime = () => {
      const endDate = new Date(auctionData.end_date);
      const now = new Date();
      
      if (now >= endDate && !isAuctionEnded) {
        setIsAuctionEnded(true);
        handleAuctionEnd();
      }
    };
    
    const timer = setInterval(checkEndTime, 1000);
    return () => clearInterval(timer);
  }, [auctionData, isAuctionEnded]);

  const handleBid = () => {
    if (!user) {
      toast.error("Debes iniciar sesión para ofertar");
      return;
    }
    
    if (!isVerified) {
      setIsVerifyDialogOpen(true);
      return;
    }
    
    if (isAuctionEnded) {
      toast.error("Esta subasta ha finalizado");
      return;
    }
    
    if (!bidAmount) {
      toast.error("Ingresa un monto para ofertar");
      return;
    }
    
    const bidValue = parseInt(bidAmount.replace(/\D/g, ''));
    if (isNaN(bidValue) || bidValue <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    
    // Validar monto mínimo
    const currentHighestBid = bids.length > 0 ? bids[0].amount : auctionData.start_price;
    const minBid = currentHighestBid + auctionData.min_increment;
    
    if (bidValue < minBid) {
      toast.error(`Tu oferta debe ser al menos $${minBid.toLocaleString('es-CL')}`);
      return;
    }
    
    // Mostrar diálogo de confirmación
    setIsBidDialogOpen(true);
  };

  const confirmBid = async () => {
    if (!id) return;
    
    const bidValue = parseInt(bidAmount.replace(/\D/g, ''));
    const holdAmount = Math.round(bidValue * 0.05);
    
    const { success, error, needsVerification } = await placeBid(id, {
      amount: bidValue,
      holdAmount
    });
    
    if (needsVerification) {
      setIsVerifyDialogOpen(true);
    } else if (success) {
      // Recargar historial de ofertas
      const { bids: updatedBids } = await getAuctionBids(id);
      setBids(updatedBids || []);
      setBidAmount('');
      setIsBidDialogOpen(false);
    }
  };

  const handleAuctionEnd = async () => {
    if (!id) return;
    
    try {
      const { success, winnerId } = await finalizeAuction(id);
      if (success) {
        // Recargar datos de la subasta y ofertas
        const { auction } = await getAuctionById(id);
        if (auction) setAuctionData(auction);
        
        const { bids: updatedBids } = await getAuctionBids(id);
        setBids(updatedBids || []);
        
        // Si hay un ganador y coincide con el usuario actual
        if (winnerId && user && winnerId === user.id) {
          toast.success("¡Felicidades! Has ganado esta subasta.");
        }
      }
    } catch (error) {
      console.error("Error al finalizar la subasta:", error);
    }
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar favoritos");
      return;
    }
    
    if (!id || isProcessingFavorite) return;
    
    setIsProcessingFavorite(true);
    try {
      if (isFavoriteAuction) {
        await removeFromFavorites(id);
        setIsFavoriteAuction(false);
      } else {
        await addToFavorites(id);
        setIsFavoriteAuction(true);
      }
    } catch (error) {
      console.error("Error al procesar favorito:", error);
    } finally {
      setIsProcessingFavorite(false);
    }
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('Enlace copiado al portapapeles');
  };

  const handleQuestionSubmitted = async () => {
    if (!id) return;
    
    setIsLoadingQuestions(true);
    try {
      const { questions: questionData, error } = await getAuctionQuestions(id);
      if (!error) {
        setQuestions(questionData || []);
      }
    } catch (error) {
      console.error("Error al recargar preguntas:", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleAnswerQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setIsAnswerDialogOpen(true);
  };

  const formatBidAmount = (value: string) => {
    // Eliminar caracteres no numéricos
    const numericValue = value.replace(/\D/g, '');
    // Formatear con separadores de miles
    const formattedValue = Number(numericValue).toLocaleString('es-CL');
    return formattedValue;
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
  const highestBid = bids.length > 0 ? bids[0].amount : auctionData.start_price;
  
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
                  {vehiclePhotos.map((photo: any, index: number) => (
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
                <h2 className="text-3xl font-bold">${highestBid.toLocaleString('es-CL')}</h2>
                <p className="text-sm text-gray-500">{bids.length} ofertas</p>
              </div>
              
              <div className="mb-6">
                {isAuctionEnded ? (
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-lg font-medium">Subasta finalizada</p>
                    {winner ? (
                      <p className="text-sm text-gray-600">
                        Ganador: {winner.profiles?.first_name || 'Usuario'} con ${winner.amount?.toLocaleString('es-CL')}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">No hubo ofertas en esta subasta</p>
                    )}
                  </div>
                ) : (
                  <CountdownTimer 
                    endTime={auctionData.end_date ? new Date(auctionData.end_date) : new Date()} 
                    detailed={true}
                  />
                )}
              </div>
              
              {user && !isAuctionEnded && !isOwner && (
                <>
                  <div className="mb-6">
                    <p className="mb-1 text-sm font-medium">Tu oferta (CLP)</p>
                    <div className="flex space-x-2">
                      <Input 
                        type="text"
                        value={bidAmount} 
                        onChange={(e) => setBidAmount(formatBidAmount(e.target.value))}
                        placeholder={`Mín ${(highestBid + auctionData.min_increment).toLocaleString('es-CL')}`}
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
                        <span>Se aplica un 5% de comisión sobre el monto ofertado.</span>
                      </li>
                      <li className="flex items-start">
                        <PlusCircle className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <span>El reloj se extenderá 2 minutos si hay ofertas en el último minuto.</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
              
              {!isVerified && user && !isOwner && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Verificación requerida</h4>
                      <p className="text-sm text-yellow-700">
                        Para participar en subastas necesitas verificar tu identidad.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-2 bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                        onClick={() => setIsVerifyDialogOpen(true)}
                      >
                        Verificar identidad
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleFavoriteClick}
                >
                  <Heart 
                    className={`mr-2 h-4 w-4 ${isFavoriteAuction ? 'text-red-500 fill-red-500' : ''}`} 
                  />
                  {isFavoriteAuction ? 'Guardado' : 'Guardar'}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
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
              <TabsTrigger value="history" className="flex-1">
                Historial
                {bids.length > 0 && (
                  <span className="ml-1.5 bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs">
                    {bids.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex-1">
                Preguntas
                {questions.length > 0 && (
                  <span className="ml-1.5 bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs">
                    {questions.length}
                  </span>
                )}
              </TabsTrigger>
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
              {isLoadingBids ? (
                <div className="text-center py-6">
                  <p>Cargando historial de ofertas...</p>
                </div>
              ) : (
                <BidHistory bids={bids} />
              )}
            </TabsContent>
            
            <TabsContent value="questions" className="pt-6">
              {isLoadingQuestions ? (
                <div className="text-center py-6">
                  <p>Cargando preguntas...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <QuestionList 
                    questions={questions} 
                    isOwner={isOwner}
                    onAnswer={handleAnswerQuestion}
                  />
                  
                  {user && !isOwner ? (
                    <div className="mt-8 pt-6 border-t">
                      <QuestionForm 
                        auctionId={id || ''} 
                        onQuestionSubmitted={handleQuestionSubmitted}
                      />
                    </div>
                  ) : !user ? (
                    <div className="mt-8 pt-6 border-t text-center">
                      <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <h3 className="text-lg font-medium mb-2">¿Tienes preguntas sobre este vehículo?</h3>
                      <p className="text-gray-500 mb-4">Inicia sesión para hacer preguntas al vendedor.</p>
                      <Button className="bg-contrareloj hover:bg-contrareloj-dark" onClick={() => window.location.href = '/auth?redirect=' + encodeURIComponent(window.location.pathname)}>
                        Iniciar sesión
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Diálogo para responder preguntas */}
          <AnswerDialog 
            isOpen={isAnswerDialogOpen}
            onClose={() => {
              setIsAnswerDialogOpen(false);
              setSelectedQuestionId(null);
            }}
            questionId={selectedQuestionId || ''}
            onAnswerSubmitted={handleQuestionSubmitted}
          />

          {/* Diálogo para confirmar oferta */}
          <BidConfirmationDialog
            isOpen={isBidDialogOpen}
            onClose={() => setIsBidDialogOpen(false)}
            bidAmount={bidAmount ? parseInt(bidAmount.replace(/\D/g, '')) : 0}
            onConfirm={confirmBid}
          />

          {/* Diálogo para verificar identidad */}
          <VerifyIdentityDialog
            isOpen={isVerifyDialogOpen}
            onClose={() => setIsVerifyDialogOpen(false)}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuctionDetail;
