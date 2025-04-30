
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
}

interface WonTabContentProps {
  wonAuctions: Auction[];
}

const WonTabContent = ({ wonAuctions }: WonTabContentProps) => {
  const navigate = useNavigate();
  
  if (wonAuctions.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wonAuctions.map((auction) => (
          <AuctionCard 
            key={auction.id} 
            id={auction.id} 
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
        <span className="text-3xl">🏆</span>
      </div>
      <h3 className="text-xl font-medium mb-2">Aún no has ganado ninguna subasta</h3>
      <p className="text-gray-500 mb-6">
        Explora entre todas nuestras subastas y comienza a ofertar hoy mismo.
      </p>
      <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white" onClick={() => navigate('/explorar')}>
        Explorar subastas
      </Button>
    </div>
  );
};

export default WonTabContent;
