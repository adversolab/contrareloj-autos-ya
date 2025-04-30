
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
  auctionId?: string | null;
}

interface SellingTabContentProps {
  sellingAuctions: Auction[];
  isLoading: boolean;
}

const SellingTabContent = ({ sellingAuctions, isLoading }: SellingTabContentProps) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return <div className="flex justify-center py-10">
      <p>Cargando tus publicaciones...</p>
    </div>;
  }

  if (sellingAuctions.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellingAuctions.map((auction) => (
          <AuctionCard 
            key={auction.id} 
            id={auction.auctionId || auction.id}
            title={auction.title} 
            description={auction.description} 
            imageUrl={auction.imageUrl || '/placeholder.svg'} 
            currentBid={auction.currentBid} 
            endTime={auction.endTime} 
            bidCount={auction.bidCount} 
            status={auction.status}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">🚗</span>
      </div>
      <h3 className="text-xl font-medium mb-2">No tienes autos a la venta</h3>
      <p className="text-gray-500 mb-6">
        Publica tu auto y véndelo al mejor precio en nuestra plataforma.
      </p>
      <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white" onClick={() => navigate('/vender')}>
        Vender mi auto
      </Button>
    </div>
  );
};

export default SellingTabContent;
