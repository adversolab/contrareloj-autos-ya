
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import CountdownTimer from './CountdownTimer';

interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
}

interface EndingSoonCarouselProps {
  auctions: Auction[];
}

const EndingSoonCarousel: React.FC<EndingSoonCarouselProps> = ({ auctions }) => {
  if (auctions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay subastas finalizando pronto disponibles.</p>
      </div>
    );
  }

  // Calculate milliseconds until auction ends
  const getTimeRemaining = (endTime: Date) => {
    return endTime.getTime() - new Date().getTime();
  };

  return (
    <Carousel
      opts={{
        align: "start",
        loop: auctions.length > 3,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {auctions.map((auction) => {
          const isUrgent = getTimeRemaining(auction.endTime) < 3600000; // Less than 1 hour
          
          return (
            <CarouselItem 
              key={auction.id} 
              className="pl-2 md:pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/3"
            >
              <Link to={`/subasta/${auction.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <img 
                      src={auction.imageUrl || '/placeholder.svg'} 
                      alt={auction.title} 
                      className="h-40 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Urgent badge for ending very soon */}
                    {isUrgent && (
                      <Badge 
                        className="absolute top-2 left-2 bg-red-500 text-white border-none animate-pulse"
                      >
                        ¡Finaliza pronto!
                      </Badge>
                    )}
                    
                    {/* Countdown timer overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                      <div className={`flex items-center ${isUrgent ? 'text-red-500' : 'text-white'} font-semibold text-sm`}>
                        <Clock className="w-4 h-4 mr-1" />
                        <CountdownTimer endTime={auction.endTime} compact={true} />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base line-clamp-1">{auction.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-2">{auction.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">OFERTA ACTUAL</p>
                        <p className="text-base font-bold">{formatCurrency(auction.currentBid)}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {auction.bidCount} ofertas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="flex justify-center mt-4 gap-2">
        <CarouselPrevious className="static relative transform-none mx-1" />
        <CarouselNext className="static relative transform-none mx-1" />
      </div>
    </Carousel>
  );
};

export default EndingSoonCarousel;
