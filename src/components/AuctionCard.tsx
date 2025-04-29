
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/services/vehicleService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuctionCardProps {
  id: string | number;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  onClick?: (e: React.MouseEvent) => void;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  currentBid,
  endTime,
  bidCount,
  onClick,
}) => {
  const { user } = useAuth();
  const [isFavoriteAuction, setIsFavoriteAuction] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !id) return;
      
      const { isFavorite: isFav } = await isFavorite(id.toString());
      setIsFavoriteAuction(isFav);
    };

    checkFavoriteStatus();
  }, [id, user]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Debes iniciar sesión para guardar favoritos");
      return;
    }

    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      if (isFavoriteAuction) {
        await removeFromFavorites(id.toString());
        setIsFavoriteAuction(false);
      } else {
        await addToFavorites(id.toString());
        setIsFavoriteAuction(true);
      }
    } catch (error) {
      console.error("Error al procesar favorito:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Link to={`/subasta/${id}`} onClick={onClick}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-48 w-full object-cover"
          />
          <button 
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow"
            onClick={handleFavoriteToggle}
          >
            <Heart 
              className={`h-5 w-5 ${isFavoriteAuction ? 'text-red-500 fill-red-500' : 'text-gray-500'} transition-colors`}
            />
          </button>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500">OFERTA ACTUAL</p>
              <p className="text-lg font-bold">
                ${currentBid.toLocaleString('es-CL')}
              </p>
              <p className="text-xs text-gray-500">{bidCount} ofertas</p>
            </div>
            
            <CountdownTimer endTime={endTime} compact={true} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AuctionCard;
