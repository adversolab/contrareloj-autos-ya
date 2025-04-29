
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { addToFavorites, removeFromFavorites, isFavorite, deleteAuction } from '@/services/vehicleService';
import CountdownTimer from '@/components/CountdownTimer';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  status: string;
  auctionId?: string; // Para casos donde el ID de la subasta es diferente del ID del objeto
}

interface AuctionCardProps {
  auction: Auction;
  onDeleted?: () => void; // Nueva prop para callback después de eliminar
}

const AuctionCard = ({ auction, onDeleted }: AuctionCardProps) => {
  const [isFav, setIsFav] = useState<boolean | null>(null);
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  // Verificar si es favorito al cargar
  const checkIfFavorite = async () => {
    if (auction.auctionId) {
      const result = await isFavorite(auction.auctionId);
      setIsFav(result.isFavorite);
    }
  };

  // Manejar la eliminación de la subasta
  const handleDeleteAuction = async () => {
    if (!auction.auctionId) return;
    
    const success = await deleteAuction(auction.auctionId);
    if (success) {
      toast.success('Subasta eliminada correctamente');
      if (onDeleted) onDeleted();
    }
  };

  useEffect(() => {
    checkIfFavorite();
  }, [auction.auctionId]);

  const [toggleFavLoading, setToggleFavLoading] = useState(false);

  const toggleFavorite = async () => {
    if (!auction.auctionId) return;

    setToggleFavLoading(true);
    try {
      if (isFav) {
        await removeFromFavorites(auction.auctionId);
        setIsFav(false);
      } else {
        await addToFavorites(auction.auctionId);
        setIsFav(true);
      }
    } finally {
      setToggleFavLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={auction.imageUrl || 'https://via.placeholder.com/400x300'}
          alt={auction.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary">{auction.status}</Badge>
        </div>
        <div className="absolute top-2 right-2">
          <CountdownTimer endTime={auction.endTime} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold leading-tight truncate">
            <Link to={auction.auctionId ? `/subasta/${auction.auctionId}` : '#'} className="hover:underline">
              {auction.title}
            </Link>
          </h3>
          {/* Botón de eliminar para administradores o en la vista de perfil */}
          {isAdmin && auction.auctionId && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente la subasta.
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
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-500">Puja actual:</span>
            <span className="font-semibold ml-1">${auction.currentBid}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              <CountdownTimer endTime={auction.endTime} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
