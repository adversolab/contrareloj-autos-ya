
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import FeaturedVehiclesSection from '@/components/FeaturedVehiclesSection';
import BrandsCarousel from '@/components/home/BrandsCarousel';
import ActiveAuctionsSection from '@/components/home/ActiveAuctionsSection';
import PartnersSection from '@/components/home/PartnersSection';
import EditorialCarousel from '@/components/home/EditorialCarousel';
import ModernHowItWorks from '@/components/home/ModernHowItWorks';
import DoubleCTA from '@/components/home/DoubleCTA';
import FeaturedAuctionShowcase from '@/components/FeaturedAuctionShowcase';
import EndingSoonCarousel from '@/components/EndingSoonCarousel';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
}

const Index = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState<Auction[]>([]);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        // First, update expired auctions
        await updateExpiredAuctions();

        const now = new Date().toISOString();

        // Get active and approved auctions that haven't expired
        const { data: auctionsData, error: auctionsError } = await supabase
          .from('auctions')
          .select(`
            id,
            start_price,
            status,
            start_date,
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
          .gte('end_date', now);

        if (auctionsError) {
          console.error('Error fetching auctions:', auctionsError);
          setLoading(false);
          return;
        }

        if (!auctionsData || auctionsData.length === 0) {
          setLoading(false);
          return;
        }

        // Get primary photos for each vehicle
        const vehicleIds = auctionsData.map(auction => auction.vehicle_id);
        const { data: photosData, error: photosError } = await supabase
          .from('vehicle_photos')
          .select('*')
          .in('vehicle_id', vehicleIds)
          .eq('is_primary', true);

        if (photosError) {
          console.error('Error fetching photos:', photosError);
        }

        // Create a map of photos by vehicle
        const photoMap = new Map();
        if (photosData) {
          photosData.forEach(photo => {
            photoMap.set(photo.vehicle_id, photo.url);
          });
        }

        // Get highest bid for each auction
        const auctionIds = auctionsData.map(auction => auction.id);
        const { data: highestBidsData, error: highestBidsError } = await supabase
          .from('bids')
          .select('auction_id, amount')
          .in('auction_id', auctionIds)
          .order('amount', { ascending: false });

        if (highestBidsError) {
          console.error('Error fetching highest bids:', highestBidsError);
        }

        // Create maps for highest bids and bid counts
        const highestBidMap = new Map();
        const bidsCountMap = new Map();
        
        if (highestBidsData) {
          // Group bids by auction_id to count them and find highest
          const bidsByAuction = highestBidsData.reduce((acc, bid) => {
            if (!acc[bid.auction_id]) {
              acc[bid.auction_id] = [];
            }
            acc[bid.auction_id].push(bid);
            return acc;
          }, {});
          
          // Now calculate highest bid and count for each auction
          Object.entries(bidsByAuction).forEach(([auctionId, bids]: [string, any[]]) => {
            const highestBid = Math.max(...bids.map(bid => bid.amount));
            const bidCount = bids.length;
            
            highestBidMap.set(auctionId, highestBid);
            bidsCountMap.set(auctionId, bidCount);
          });
        }

        // Format data for AuctionCard components
        const formattedAuctions = auctionsData.map(auction => {
          const vehicle = auction.vehicles;
          // Use highest bid if exists, otherwise use start_price
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
            bidCount: bidsCountMap.get(auction.id) || 0
          };
        });

        const now_date = new Date();
        
        // Featured auctions (with most bids)
        const featured = [...formattedAuctions]
          .sort((a, b) => b.bidCount - a.bidCount)
          .slice(0, 3);
        
        // Auctions ending soon
        const endingSoon = [...formattedAuctions]
          .filter(auction => auction.endTime > now_date)
          .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
          .slice(0, 3);

        setFeaturedAuctions(featured);
        setEndingSoonAuctions(endingSoon);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Function to update expired auctions
  const updateExpiredAuctions = async () => {
    try {
      const now = new Date().toISOString();
      
      // Update auctions that are marked as active but have expired
      const { error } = await supabase
        .from('auctions')
        .update({ status: 'finished' })
        .eq('status', 'active')
        .lt('end_date', now);

      if (error) {
        console.error('Error updating expired auctions:', error);
      } else {
        console.log('Expired auctions updated on home page');
      }
    } catch (error) {
      console.error('Error in updateExpiredAuctions:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar />
      
      <Hero />
      
      <main className="flex-grow w-full">
        {/* Brands Carousel */}
        <BrandsCarousel />
        
        {/* Featured/Highlighted Vehicles Section */}
        <FeaturedVehiclesSection />
        
        {/* Active Auctions Section */}
        <ActiveAuctionsSection />
        
        {/* Featured Auctions */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Subastas Destacadas</h2>
            <Link to="/explorar">
              <Button variant="link" className="text-contrareloj">
                Ver todas
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-10 h-10 text-contrareloj animate-spin" />
            </div>
          ) : (
            <FeaturedAuctionShowcase auctions={featuredAuctions} />
          )}
        </section>
        
        {/* Ending Soon */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Finalizando Pronto</h2>
            <Link to="/explorar?sort=endingSoon">
              <Button variant="link" className="text-contrareloj">
                Ver todas
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-10 h-10 text-contrareloj animate-spin" />
            </div>
          ) : (
            <EndingSoonCarousel auctions={endingSoonAuctions} />
          )}
        </section>
        
        {/* Partners Section */}
        <PartnersSection />
        
        {/* Editorial Carousel */}
        <EditorialCarousel />
        
        {/* How It Works - Modern Design */}
        <ModernHowItWorks />
        
        {/* Double CTA Section */}
        <DoubleCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
