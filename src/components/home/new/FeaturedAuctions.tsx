
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, Clock, Eye } from 'lucide-react';

interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
}

interface Props {
  featuredAuctions: Auction[];
  endingSoonAuctions: Auction[];
  loading: boolean;
}

const FeaturedAuctions = ({ featuredAuctions, endingSoonAuctions, loading }: Props) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'ending'>('featured');

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Finalizada';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const AuctionCard = ({ auction }: { auction: Auction }) => (
    <Link to={`/subasta/${auction.id}`} className="group">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={auction.imageUrl} 
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-contrareloj text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTimeRemaining(auction.endTime)}
          </div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {auction.bidCount} ofertas
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-contrareloj transition-colors">
            {auction.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{auction.description}</p>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Precio actual</p>
              <p className="text-2xl font-bold text-contrareloj">
                ${auction.currentBid.toLocaleString()}
              </p>
            </div>
            <Button variant="outline" className="group-hover:bg-contrareloj group-hover:text-white transition-colors">
              Ver subasta
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 text-contrareloj animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Subastas en vivo</h2>
          <p className="text-xl text-gray-600">Descubre las mejores oportunidades del momento</p>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'featured'
                  ? 'bg-contrareloj text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Subastas destacadas
            </button>
            <button
              onClick={() => setActiveTab('ending')}
              className={`px-6 py-3 rounded-md font-semibold transition-all ${
                activeTab === 'ending'
                  ? 'bg-contrareloj text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Finalizando pronto
            </button>
          </div>
        </div>
        
        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {(activeTab === 'featured' ? featuredAuctions : endingSoonAuctions)
            .slice(0, 6)
            .map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center">
          <Link to="/explorar">
            <Button size="lg" className="bg-contrareloj hover:bg-contrareloj-dark text-white px-8 py-4 text-lg">
              Ver todas las subastas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAuctions;
