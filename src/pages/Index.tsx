
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import NewHero from '@/components/home/new/NewHero';
import BrandsCarousel from '@/components/home/new/BrandsCarousel';
import FeaturedAuctions from '@/components/home/new/FeaturedAuctions';
import EditorialCarousel from '@/components/home/new/EditorialCarousel';
import PartnersSection from '@/components/home/new/PartnersSection';
import AdvertisingCarousel from '@/components/home/new/AdvertisingCarousel';
import HowItWorks from '@/components/home/new/HowItWorks';
import SellCTA from '@/components/home/new/SellCTA';
import { supabase } from '@/integrations/supabase/client';

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

        if (auctionsError || !auctionsData) {
          setLoading(false);
          return;
        }

        // Get primary photos for each vehicle
        const vehicleIds = auctionsData.map(auction => auction.vehicle_id);
        const { data: photosData } = await supabase
          .from('vehicle_photos')
          .select('*')
          .in('vehicle_id', vehicleIds)
          .eq('is_primary', true);

        // Create a map of photos by vehicle
        const photoMap = new Map();
        if (photosData) {
          photosData.forEach(photo => {
            photoMap.set(photo.vehicle_id, photo.url);
          });
        }

        // Get highest bid for each auction
        const auctionIds = auctionsData.map(auction => auction.id);
        const { data: highestBidsData } = await supabase
          .from('bids')
          .select('auction_id, amount')
          .in('auction_id', auctionIds)
          .order('amount', { ascending: false });

        // Create maps for highest bids and bid counts
        const highestBidMap = new Map();
        const bidsCountMap = new Map();
        
        if (highestBidsData) {
          const bidsByAuction = highestBidsData.reduce((acc, bid) => {
            if (!acc[bid.auction_id]) {
              acc[bid.auction_id] = [];
            }
            acc[bid.auction_id].push(bid);
            return acc;
          }, {});
          
          Object.entries(bidsByAuction).forEach(([auctionId, bids]: [string, any[]]) => {
            const highestBid = Math.max(...bids.map(bid => bid.amount));
            const bidCount = bids.length;
            
            highestBidMap.set(auctionId, highestBid);
            bidsCountMap.set(auctionId, bidCount);
          });
        }

        // Format data for auction components
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
            bidCount: bidsCountMap.get(auction.id) || 0
          };
        });

        const now_date = new Date();
        
        // Featured auctions (with most bids)
        const featured = [...formattedAuctions]
          .sort((a, b) => b.bidCount - a.bidCount)
          .slice(0, 6);
        
        // Auctions ending soon
        const endingSoon = [...formattedAuctions]
          .filter(auction => auction.endTime > now_date)
          .sort((a, b) => a.endTime.getTime() - b.endTime.getTime())
          .slice(0, 6);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <NewHero />
      
      {/* Main Content */}
      <main className="flex-grow">
        {/* Brands Carousel */}
        <BrandsCarousel />
        
        {/* Auctions Sections */}
        <FeaturedAuctions 
          featuredAuctions={featuredAuctions}
          endingSoonAuctions={endingSoonAuctions}
          loading={loading}
        />
        
        {/* Editorial Carousel */}
        <EditorialCarousel />
        
        {/* Partners Section */}
        <PartnersSection />
        
        {/* Advertising Carousel */}
        <AdvertisingCarousel />
        
        {/* How It Works */}
        <HowItWorks />
        
        {/* Sell CTA */}
        <SellCTA />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
