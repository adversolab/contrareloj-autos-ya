
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';

interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
}

interface FeaturedAuctionShowcaseProps {
  auctions: Auction[];
}

const FeaturedAuctionShowcase: React.FC<FeaturedAuctionShowcaseProps> = ({ auctions }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (auctions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay subastas destacadas disponibles actualmente.</p>
      </div>
    );
  }

  const currentAuction = auctions[currentIndex];
  
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? auctions.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === auctions.length - 1 ? 0 : prevIndex + 1));
  };

  const daysLeft = Math.ceil((currentAuction.endTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="w-full">
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="flex flex-col md:flex-row">
          {/* Image section with gradient overlay */}
          <div className="relative w-full md:w-7/12 h-64 md:h-auto">
            <img 
              src={currentAuction.imageUrl || '/placeholder.svg'} 
              alt={currentAuction.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
            
            {/* Navigation controls */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
              <Button 
                onClick={handlePrevious} 
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white text-gray-800 rounded-full h-10 w-10"
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Anterior</span>
              </Button>
              <Button 
                onClick={handleNext} 
                variant="outline" 
                size="icon"
                className="bg-white/80 hover:bg-white text-gray-800 rounded-full h-10 w-10"
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Siguiente</span>
              </Button>
            </div>
            
            {/* Country badge */}
            <Badge className="absolute top-4 left-4 bg-white text-gray-800 hover:bg-gray-100">
              Chile
            </Badge>
            
            {/* Dots navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {auctions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Content section */}
          <div className="w-full md:w-5/12 p-6 md:p-8 bg-white">
            <div className="mb-4">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold line-clamp-2 mb-2">
                  {currentAuction.title}
                </h2>
                <Badge variant="outline" className="bg-contrareloj/10 text-contrareloj border-contrareloj">
                  Destacado
                </Badge>
              </div>
              
              <p className="text-gray-600 line-clamp-3 mb-4">
                {currentAuction.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">OFERTA ACTUAL</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(currentAuction.currentBid)}</p>
                <p className="text-xs text-gray-500">{currentAuction.bidCount} ofertas</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">TIEMPO RESTANTE</p>
                <p className="text-xl font-bold text-gray-900">{daysLeft} días</p>
                <p className="text-xs text-gray-500">Finaliza {currentAuction.endTime.toLocaleDateString('es-CL')}</p>
              </div>
            </div>
            
            <Link to={`/subasta/${currentAuction.id}`} className="w-full">
              <Button className="w-full bg-contrareloj hover:bg-contrareloj-dark text-white">
                Ver más detalles
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeaturedAuctionShowcase;
