import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuctionCard from '@/components/AuctionCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Auction {
  id: string | number;
  title: string;
  description: string;
  imageUrl?: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  status?: string;
  vehicleId?: string;
}

interface DraftsTabContentProps {
  draftAuctions: Auction[];
  isLoading: boolean;
  onDelete: () => void;
}

const DraftsTabContent = ({ draftAuctions, isLoading, onDelete }: DraftsTabContentProps) => {
  const navigate = useNavigate();
  const [auctionsWithImages, setAuctionsWithImages] = useState<Auction[]>([]);
  
  useEffect(() => {
    const loadVehicleImages = async () => {
      if (!draftAuctions.length) return;
      
      const updatedAuctions = await Promise.all(
        draftAuctions.map(async (auction) => {
          if (!auction.vehicleId) return auction;
          
          try {
            // Fetch primary image for this vehicle
            const { data: photos, error } = await supabase
              .from('vehicle_photos')
              .select('url')
              .eq('vehicle_id', auction.vehicleId)
              .eq('is_primary', true)
              .limit(1);
            
            console.log(`Fetched photos for vehicle ${auction.vehicleId}:`, photos);
            
            if (error) {
              console.error(`Error fetching image for auction ${auction.id}:`, error);
              return auction;
            }
            
            // If we found a primary image, update the auction with it
            if (photos && photos.length > 0) {
              return {
                ...auction,
                imageUrl: photos[0].url
              };
            }
            
            return auction;
          } catch (err) {
            console.error(`Error processing auction ${auction.id}:`, err);
            return auction;
          }
        })
      );
      
      setAuctionsWithImages(updatedAuctions);
    };
    
    loadVehicleImages();
  }, [draftAuctions]);
  
  const handleEditDraft = (vehicleId: string) => {
    navigate(`/vender?draft=${vehicleId}`);
  };
  
  if (isLoading) {
    return <div className="flex justify-center py-10">
      <p>Cargando tus borradores...</p>
    </div>;
  }

  const displayAuctions = auctionsWithImages.length > 0 ? auctionsWithImages : draftAuctions;

  if (displayAuctions.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAuctions.map((draft) => (
          <AuctionCard 
            key={draft.id} 
            id={draft.id}
            title={draft.title} 
            description={draft.description} 
            imageUrl={draft.imageUrl || '/placeholder.svg'} 
            currentBid={draft.currentBid} 
            endTime={draft.endTime} 
            bidCount={draft.bidCount} 
            status="draft"
            isDraft={true}
            vehicleId={draft.vehicleId}
            onDelete={onDelete}
            onEdit={() => handleEditDraft(draft.vehicleId || draft.id.toString())}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">📝</span>
      </div>
      <h3 className="text-xl font-medium mb-2">No tienes borradores guardados</h3>
      <p className="text-gray-500 mb-6">
        Tus publicaciones incompletas aparecerán aquí para que puedas continuar con ellas más tarde.
      </p>
      <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white" onClick={() => navigate('/vender')}>
        Vender mi auto
      </Button>
    </div>
  );
};

export default DraftsTabContent;
