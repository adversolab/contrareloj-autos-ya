
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuctionCard from '@/components/AuctionCard';
import { Button } from '@/components/ui/button';

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
  
  if (isLoading) {
    return <div className="flex justify-center py-10">
      <p>Cargando tus borradores...</p>
    </div>;
  }

  if (draftAuctions.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {draftAuctions.map((draft) => (
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
