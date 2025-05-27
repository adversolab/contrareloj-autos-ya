
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import { Auction } from './types';
import HighlightButton from './HighlightButton';

interface SellingTabContentProps {
  sellingAuctions: Auction[];
  isLoading: boolean;
}

const SellingTabContent: React.FC<SellingTabContentProps> = ({
  sellingAuctions,
  isLoading
}) => {
  const [auctions, setAuctions] = useState(sellingAuctions);

  // Update local state when props change
  React.useEffect(() => {
    setAuctions(sellingAuctions);
  }, [sellingAuctions]);

  const handleHighlightSuccess = (auctionId: string) => {
    // Update the local state to reflect the highlight
    setAuctions(prev => prev.map(auction => 
      auction.id === auctionId 
        ? { ...auction, highlighted: true }
        : auction
    ));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Cargando tus subastas activas...</p>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No tienes subastas activas en este momento.</p>
        <Link to="/vender">
          <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white">
            Publicar vehículo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {auctions.map((auction) => (
        <Card key={auction.id} className="overflow-hidden">
          <div className="relative">
            <img 
              src={auction.imageUrl} 
              alt={auction.title}
              className="w-full h-48 object-cover"
            />
            {auction.highlighted && (
              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                DESTACADO
              </div>
            )}
          </div>
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <span>{auction.title}</span>
            </CardTitle>
            <CardDescription>{auction.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Precio actual:</span>
                <span className="font-semibold">{formatCurrency(auction.currentBid)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ofertas:</span>
                <span>{auction.bidCount}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Finaliza:</span>
                <span>{auction.endTime.toLocaleDateString()}</span>
              </div>
              
              <div className="flex flex-col gap-2 pt-3">
                <div className="flex gap-2">
                  <Link to={`/subasta/${auction.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver subasta
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
                
                {/* Botón para destacar si aún no está destacado */}
                {!auction.highlighted && auction.vehicleId && (
                  <HighlightButton
                    vehicleId={auction.vehicleId}
                    isHighlighted={!!auction.highlighted}
                    onHighlightSuccess={() => handleHighlightSuccess(auction.id)}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SellingTabContent;
