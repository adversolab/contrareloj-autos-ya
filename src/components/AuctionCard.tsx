
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Trash2 } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { addToFavorites, removeFromFavorites, isFavorite, deleteVehicleWithAuction } from '@/services/vehicleService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface AuctionCardProps {
  id: string | number;
  title: string;
  description: string;
  imageUrl?: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  status?: string;
  onClick?: (e: React.MouseEvent) => void;
  isDraft?: boolean;
  onDelete?: () => void;
  vehicleId?: string;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  title,
  description,
  imageUrl = '',
  currentBid,
  endTime,
  bidCount,
  status,
  onClick,
  isDraft = false,
  onDelete,
  vehicleId
}) => {
  const { user } = useAuth();
  const [isFavoriteAuction, setIsFavoriteAuction] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleId) return;
    
    setIsProcessing(true);
    try {
      const result = await deleteVehicleWithAuction(vehicleId);
      if (result.success) {
        toast.success("Borrador eliminado con éxito");
        if (onDelete) onDelete();
      } else {
        toast.error("Error al eliminar el borrador");
      }
    } catch (error) {
      console.error("Error al eliminar borrador:", error);
      toast.error("Error al eliminar el borrador");
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const content = (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={imageUrl || '/placeholder.svg'} 
          alt={title} 
          className="h-48 w-full object-cover"
        />
        {!isDraft && (
          <button 
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow"
            onClick={handleFavoriteToggle}
          >
            <Heart 
              className={`h-5 w-5 ${isFavoriteAuction ? 'text-red-500 fill-red-500' : 'text-gray-500'} transition-colors`}
            />
          </button>
        )}
        {isDraft && (
          <button 
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow"
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-500 transition-colors" />
          </button>
        )}
        {status && (
          <Badge 
            variant={
              status === 'active' ? 'success' : 
              status === 'pending_approval' ? 'warning' : 
              status === 'draft' ? 'warning' : 
              'outline'
            }
            className="absolute bottom-2 left-2"
          >
            {status === 'active' ? 'Activa' : 
             status === 'pending_approval' ? 'En revisión' :
             status === 'draft' ? 'Borrador' : 
             status}
          </Badge>
        )}
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
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este borrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );

  if (isDraft && vehicleId) {
    return (
      <Link to={`/vender?edit=${vehicleId}`} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <Link to={`/subasta/${id}`} onClick={onClick}>
      {content}
    </Link>
  );
};

export default AuctionCard;
