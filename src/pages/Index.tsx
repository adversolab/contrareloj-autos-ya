import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AuctionCard from '@/components/AuctionCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import FeaturedAuctionShowcase from '@/components/FeaturedAuctionShowcase';
import EndingSoonCarousel from '@/components/EndingSoonCarousel';

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
        // Get active and approved auctions
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
          .eq('is_approved', true);

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

        // Filter by end date
        const now = new Date();
        
        // Featured auctions (with most bids)
        const featured = [...formattedAuctions]
          .sort((a, b) => b.bidCount - a.bidCount)
          .slice(0, 3);
        
        // Auctions ending soon
        const endingSoon = [...formattedAuctions]
          .filter(auction => auction.endTime > now)
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <Hero />
      
      <main className="flex-grow">
        {/* Featured Auctions */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Subastas Destacadas</h2>
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
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Finalizando Pronto</h2>
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
        
        {/* How It Works */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-contrareloj-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-contrareloj text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Explora</h3>
                <p className="text-gray-600">
                  Navega por nuestra selección de vehículos y encuentra el que se ajuste a tus necesidades.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-contrareloj-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-contrareloj text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Oferta</h3>
                <p className="text-gray-600">
                  Participa en la subasta realizando ofertas seguras antes de que finalice el tiempo.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-contrareloj-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-contrareloj text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Compra</h3>
                <p className="text-gray-600">
                  Si ganas la subasta, completa la compra y ¡disfruta de tu nuevo vehículo!
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/ayuda/como-funciona">
                <Button variant="outline" className="text-contrareloj border-contrareloj hover:bg-contrareloj hover:text-white">
                  Saber más
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-contrareloj py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">¿Tienes un auto para vender?</h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Véndelo de forma rápida, segura y al mejor precio con nuestras subastas.
            </p>
            <Link to="/vender">
              <Button className="bg-white text-contrareloj hover:bg-gray-100 text-lg px-8 py-6">
                Vende tu auto ahora
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
