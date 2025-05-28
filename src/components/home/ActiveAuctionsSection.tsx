
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuctionCard from '@/components/AuctionCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
}

const ActiveAuctionsSection = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveAuctions = async () => {
      try {
        const now = new Date().toISOString();

        const { data: auctionsData, error } = await supabase
          .from('auctions')
          .select(`
            id,
            start_price,
            end_date,
            vehicle_id,
            vehicles (
              id,
              brand,
              model,
              year,
              description
            )
          `)
          .eq('status', 'active')
          .eq('is_approved', true)
          .gte('end_date', now)
          .order('end_date', { ascending: true })
          .limit(6);

        if (error) {
          console.error('Error fetching active auctions:', error);
          return;
        }

        if (!auctionsData || auctionsData.length === 0) {
          setLoading(false);
          return;
        }

        // Get photos for each vehicle
        const vehicleIds = auctionsData.map(auction => auction.vehicle_id);
        const { data: photosData } = await supabase
          .from('vehicle_photos')
          .select('*')
          .in('vehicle_id', vehicleIds)
          .eq('is_primary', true);

        const photoMap = new Map();
        if (photosData) {
          photosData.forEach(photo => {
            photoMap.set(photo.vehicle_id, photo.url);
          });
        }

        // Get highest bids
        const auctionIds = auctionsData.map(auction => auction.id);
        const { data: bidsData } = await supabase
          .from('bids')
          .select('auction_id, amount')
          .in('auction_id', auctionIds)
          .order('amount', { ascending: false });

        const highestBidMap = new Map();
        const bidCountMap = new Map();
        
        if (bidsData) {
          const bidsByAuction = bidsData.reduce((acc, bid) => {
            if (!acc[bid.auction_id]) {
              acc[bid.auction_id] = [];
            }
            acc[bid.auction_id].push(bid);
            return acc;
          }, {});
          
          Object.entries(bidsByAuction).forEach(([auctionId, bids]: [string, any[]]) => {
            const highestBid = Math.max(...bids.map(bid => bid.amount));
            highestBidMap.set(auctionId, highestBid);
            bidCountMap.set(auctionId, bids.length);
          });
        }

        const formattedAuctions = auctionsData.map(auction => {
          const vehicle = auction.vehicles;
          const currentBid = highestBidMap.has(auction.id) 
            ? highestBidMap.get(auction.id) 
            : auction.start_price;
            
          return {
            id: auction.id,
            title: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Vehicle',
            description: vehicle?.description || 'No description available',
            imageUrl: photoMap.get(auction.vehicle_id) || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
            currentBid: currentBid,
            endTime: new Date(auction.end_date),
            bidCount: bidCountMap.get(auction.id) || 0
          };
        });

        setAuctions(formattedAuctions);
      } catch (error) {
        console.error('Error fetching active auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAuctions();
  }, []);

  if (loading) {
    return (
      <section className="py-12 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Subastas Activas</h2>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-10 h-10 text-contrareloj animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (auctions.length === 0) {
    return null;
  }

  return (
    <section className="py-12 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Subastas Activas</h2>
          <Link to="/explorar">
            <Button variant="link" className="text-contrareloj">
              Ver todas
            </Button>
          </Link>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {auctions.map((auction) => (
              <CarouselItem key={auction.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="relative">
                  {/* Time remaining badge */}
                  <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {(() => {
                      const now = new Date();
                      const timeLeft = auction.endTime.getTime() - now.getTime();
                      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      
                      if (days > 0) return `${days}d ${hours}h`;
                      if (hours > 0) return `${hours}h`;
                      return 'Finalizando';
                    })()}
                  </div>
                  <AuctionCard
                    id={auction.id}
                    title={auction.title}
                    description={auction.description}
                    imageUrl={auction.imageUrl}
                    currentBid={auction.currentBid}
                    endTime={auction.endTime}
                    bidCount={auction.bidCount}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
};

export default ActiveAuctionsSection;
