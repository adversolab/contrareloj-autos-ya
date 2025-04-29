
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Heart, 
  HeartOff, 
  Clock, 
  User, 
  MapPin, 
  Calendar, 
  Fuel, 
  Gauge, 
  Settings, 
  Check, 
  X, 
  ChevronRight,
  Trash
} from 'lucide-react';

import { 
  getAuctionById, 
  isFavorite, 
  addToFavorites, 
  removeFromFavorites,
  getAuctionQuestions,
  getAuctionBids,
  placeBid,
  finalizeAuction,
  getVerificationStatus,
  deleteAuction,
  submitQuestion,
  answerQuestion
} from '@/services/vehicleService';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CountdownTimer from '@/components/CountdownTimer';
import QuestionForm from '@/components/QuestionForm';
import QuestionList from '@/components/QuestionList';
import BidHistory from '@/components/BidHistory';
import BidConfirmationDialog from '@/components/BidConfirmationDialog';
import VerifyIdentityDialog from '@/components/VerifyIdentityDialog';
import AnswerDialog from '@/components/AnswerDialog';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface Auction {
  id: string;
  vehicle_id: string;
  start_price: number;
  reserve_price: number;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  min_increment: number;
  is_approved: boolean;
  created_at: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    kilometers: number;
    fuel: string;
    transmission: string;
    description: string;
    user_id: string;
  };
}

const AuctionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [isFav, setIsFav] = useState<boolean | null>(null);
  const [toggleFavLoading, setToggleFavLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [bids, setBids] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [isIdentityDialogOpen, setIsIdentityDialogOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    hasRut: false,
    hasDocuments: false,
    hasSelfie: false
  });
  const [isAnswering, setIsAnswering] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  const fetchAuction = async () => {
    if (id) {
      const { auction: fetchedAuction } = await getAuctionById(id);
      setAuction(fetchedAuction);
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (id) {
      const { questions: fetchedQuestions } = await getAuctionQuestions(id);
      setQuestions(fetchedQuestions);
    }
  };

  const fetchBids = async () => {
    if (id) {
      const { bids: fetchedBids } = await getAuctionBids(id);
      setBids(fetchedBids);
    }
  };

  const checkIsFavorite = async () => {
    if (id) {
      const { isFavorite: fav } = await isFavorite(id);
      setIsFav(fav);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setToggleFavLoading(true);
    if (isFav) {
      await removeFromFavorites(id);
      setIsFav(false);
    } else {
      await addToFavorites(id);
      setIsFav(true);
    }
    setToggleFavLoading(false);
  };

  const handleSubmitQuestion = async () => {
    if (!id || newQuestion.trim() === '') return;
    
    const result = await submitQuestion(id, newQuestion);
    if (result.success) {
      setNewQuestion('');
      fetchQuestions();
    }
  };

  const handleOpenBidDialog = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsBidDialogOpen(true);
  };

  const handleCloseBidDialog = () => {
    setIsBidDialogOpen(false);
  };

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBidAmount(Number(e.target.value));
  };

  const handlePlaceBid = async () => {
    if (!id) return;

    // Check verification status before placing bid
    if (!verificationStatus.isVerified) {
      setIsIdentityDialogOpen(true);
      return;
    }

    const result = await placeBid(id, bidAmount);
    if (result.success) {
      fetchBids();
      handleCloseBidDialog();
    }
  };

  const handleCloseIdentityDialog = () => {
    setIsIdentityDialogOpen(false);
  };

  const fetchVerificationStatus = async () => {
    const status = await getVerificationStatus();
    setVerificationStatus(status);
  };

  const handleFinalizeAuction = async () => {
    if (!id) return;
    const result = await finalizeAuction(id);
    if (result.success) {
      // Handle success, maybe navigate to a winner page or display a message
      console.log('Auction finalized, winner ID:', result.winnerId);
    }
  };

  const handleAnswer = (questionId: string) => {
    setIsAnswering(questionId);
  };

  const handleCloseAnswerDialog = () => {
    setIsAnswering(null);
    setAnswerText('');
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswerText(e.target.value);
  };

  const handleSubmitAnswer = async () => {
    if (!isAnswering) return;
    const result = await answerQuestion(isAnswering, answerText);
    if (result.success) {
      fetchQuestions();
      handleCloseAnswerDialog();
    }
  };
  
  // Add new function to handle auction deletion
  const handleDeleteAuction = async () => {
    if (!id) return;
    
    const success = await deleteAuction(id);
    if (success) {
      toast.success('Subasta eliminada correctamente');
      navigate('/explorar');
    }
  };

  useEffect(() => {
    fetchAuction();
    checkIsFavorite();
    fetchQuestions();
    fetchBids();
    fetchVerificationStatus();
  }, [id, navigate]);

  // Modify the return statement to include the delete button
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          Cargando...
        </div>
      ) : (
        auction && (
          <>
            <div className="bg-white shadow">
              <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      <Clock className="mr-2 h-4 w-4" />
                      Finaliza el {auction.end_date ? formatDate(auction.end_date) : 'Desconocida'}
                    </Badge>
                    <CountdownTimer endTime={new Date(auction.end_date)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <User className="mr-2 h-4 w-4" />
                    {auction.vehicle?.user_id}
                    <MapPin className="mr-2 h-4 w-4" />
                    Ubicación
                  </div>
                </div>
              </div>
            </div>
            
            <div className="container mx-auto px-4 py-6">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                  {auction ? `${auction.vehicle?.brand} ${auction.vehicle?.model} ${auction.vehicle?.year}` : 'Cargando...'}
                </h1>
                <div className="flex gap-2">
                  {/* Botón de favoritos */}
                  {isFav !== null && user && (
                    <Button
                      variant="outline"
                      onClick={toggleFavorite}
                      disabled={toggleFavLoading}
                    >
                      {isFav ? (
                        <>
                          <HeartOff className="mr-2 h-4 w-4" /> Quitar de favoritos
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" /> Agregar a favoritos
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Nuevo botón de eliminar para administradores y creadores */}
                  {auction && user && (profile?.role === 'admin' || auction.vehicle?.user_id === user.id) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash className="mr-2 h-4 w-4" /> Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la subasta y todos sus datos asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAuction}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna izquierda */}
                <div className="md:col-span-1">
                  <img
                    src="https://via.placeholder.com/600x400"
                    alt="Vehicle"
                    className="rounded-lg shadow-md w-full"
                  />
                  
                  <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Detalles del vehículo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Marca:</p>
                        <p>{auction.vehicle?.brand}</p>
                      </div>
                      <div>
                        <p className="font-medium">Modelo:</p>
                        <p>{auction.vehicle?.model}</p>
                      </div>
                      <div>
                        <p className="font-medium">Año:</p>
                        <p>{auction.vehicle?.year}</p>
                      </div>
                      <div>
                        <p className="font-medium">Kilometraje:</p>
                        <p>{auction.vehicle?.kilometers} km</p>
                      </div>
                      <div>
                        <p className="font-medium">Combustible:</p>
                        <p>{auction.vehicle?.fuel}</p>
                      </div>
                      <div>
                        <p className="font-medium">Transmisión:</p>
                        <p>{auction.vehicle?.transmission}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-medium">Descripción:</p>
                      <p>{auction.vehicle?.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Columna derecha */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Subasta</h2>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-600">Precio inicial:</p>
                        <p className="text-2xl font-bold">
                          ${auction.start_price.toLocaleString('es-CL')}
                        </p>
                      </div>
                      <div>
                        <Button onClick={handleOpenBidDialog}>
                          Ofertar
                        </Button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-gray-600">Estado:</p>
                      <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>
                        {auction.status === 'active' ? 'Activa' : 'Finalizada'}
                      </Badge>
                    </div>
                    {profile?.role === 'admin' && auction.status === 'active' && (
                      <Button variant="destructive" onClick={handleFinalizeAuction}>
                        Finalizar Subasta
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Preguntas y respuestas</h2>
                    <QuestionList 
                      questions={questions} 
                      isOwner={profile?.role === 'admin'}
                      onAnswer={handleAnswer}
                    />
                    {user && (
                      <QuestionForm 
                        auctionId={id || ''} 
                        onQuestionSubmitted={fetchQuestions}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-4">Historial de ofertas</h2>
                <BidHistory bids={bids} />
              </div>
            </div>
            
            <BidConfirmationDialog
              isOpen={isBidDialogOpen}
              onClose={handleCloseBidDialog}
              onConfirm={handlePlaceBid}
              currentBid={auction.start_price}
              minIncrement={auction.min_increment}
            />
            
            <VerifyIdentityDialog
              isOpen={isIdentityDialogOpen}
              onClose={handleCloseIdentityDialog}
            />
            
            <AnswerDialog
              isOpen={!!isAnswering}
              onClose={handleCloseAnswerDialog}
              onSubmit={handleSubmitAnswer}
            />
          </>
        )
      )}
    </div>
  );
};

export default AuctionDetail;
