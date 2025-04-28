
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface AuctionCardProps {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  currentBid,
  endTime,
  bidCount,
}) => {
  return (
    <Link to={`/subasta/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={title} 
            className="h-48 w-full object-cover"
          />
          <button 
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow"
            onClick={(e) => {
              e.preventDefault();
              console.log("Added to favorites");
            }}
          >
            <Heart className="h-5 w-5 text-gray-500 hover:text-contrareloj-red" />
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
