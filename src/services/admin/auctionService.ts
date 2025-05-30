
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminAuction } from './types';

// Auction management functions
export async function getAuctions() {
  try {
    console.log('Admin service: Fetching all auctions...');
    
    // First get all auctions
    const { data: auctionsData, error: auctionsError } = await supabase
      .from('auctions')
      .select('*, vehicle_id')
      .order('created_at', { ascending: false });
      
    if (auctionsError) {
      console.error('Error fetching auctions:', auctionsError);
      toast.error('Failed to load auctions');
      return { auctions: [] };
    }

    console.log('Admin service: Number of auctions returned:', auctionsData ? auctionsData.length : 0);

    // Then get vehicle and user information for each auction
    const auctions: AdminAuction[] = [];
    
    for (const auction of auctionsData) {
      // Get vehicle info if vehicle_id exists
      let vehicleInfo = { brand: 'Unknown', model: 'Unknown', year: 0 };
      let userInfo = { email: 'unknown@email.com', first_name: null, last_name: null };
      
      if (auction.vehicle_id) {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('brand, model, year, user_id')
          .eq('id', auction.vehicle_id)
          .single();
          
        if (!vehicleError && vehicleData) {
          vehicleInfo = {
            brand: vehicleData.brand,
            model: vehicleData.model,
            year: vehicleData.year
          };
          
          // Get user info if user_id exists in vehicle data
          if (vehicleData.user_id) {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', vehicleData.user_id)
              .single();
              
            if (!userError && userData) {
              userInfo = {
                email: userData.email || 'unknown@email.com',
                first_name: userData.first_name,
                last_name: userData.last_name
              };
            }
          }
        }
      }
      
      auctions.push({
        id: auction.id,
        start_price: auction.start_price,
        reserve_price: auction.reserve_price,
        status: auction.status,
        vehicle_id: auction.vehicle_id,
        is_approved: auction.is_approved || false,
        created_at: auction.created_at,
        vehicle: vehicleInfo,
        user: userInfo
      });
    }
    
    console.log("Admin service: Total auctions found:", auctions.length);
    return { auctions };
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to load auctions');
    return { auctions: [] };
  }
}

export async function approveAuction(auctionId: string) {
  try {
    const now = new Date();
    
    // Obtener información de la subasta
    const { data: auction, error: fetchError } = await supabase
      .from('auctions')
      .select('duration_days')
      .eq('id', auctionId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching auction information:', fetchError);
      toast.error('Failed to fetch auction information');
      return false;
    }
    
    // Calcular fechas para la subasta activa
    const startDate = now;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (auction?.duration_days || 7)); // Use defined duration or 7 days default
    
    // Update auction: approve and change status to active
    const { error } = await supabase
      .from('auctions')
      .update({ 
        is_approved: true,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error approving auction:', error);
      toast.error('Failed to approve auction');
      return false;
    }
    
    toast.success('Auction approved and activated successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to approve auction');
    return false;
  }
}

export async function pauseAuction(auctionId: string) {
  try {
    console.log('Pausing auction:', auctionId);
    const { error } = await supabase
      .from('auctions')
      .update({ status: 'paused' })
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error pausing auction:', error);
      toast.error('Failed to pause the auction');
      return false;
    }
    
    console.log('Auction paused successfully');
    toast.success('Auction paused successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to pause the auction');
    return false;
  }
}

export async function deleteAuction(auctionId: string) {
  try {
    console.log('Deleting auction:', auctionId);
    
    // First get the vehicle ID associated with the auction
    const { data: auction, error: fetchError } = await supabase
      .from('auctions')
      .select('vehicle_id')
      .eq('id', auctionId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching auction information:', fetchError);
      toast.error('Failed to fetch auction information');
      return false;
    }
    
    const vehicleId = auction?.vehicle_id;
    
    // First delete any related records that might cause foreign key constraints
    if (vehicleId) {
      // Delete vehicle features
      const { error: featuresError } = await supabase
        .from('vehicle_features')
        .delete()
        .eq('vehicle_id', vehicleId);
        
      if (featuresError) {
        console.error('Error deleting vehicle features:', featuresError);
      }
        
      // Delete vehicle photos
      const { error: photosError } = await supabase
        .from('vehicle_photos')
        .delete()
        .eq('vehicle_id', vehicleId);
        
      if (photosError) {
        console.error('Error deleting vehicle photos:', photosError);
      }
    }
    
    // Delete any bids related to the auction
    const { error: bidsError } = await supabase
      .from('bids')
      .delete()
      .eq('auction_id', auctionId);
      
    if (bidsError) {
      console.error('Error deleting auction bids:', bidsError);
    }
    
    // Delete any questions related to the auction
    const { error: questionsError } = await supabase
      .from('auction_questions')
      .delete()
      .eq('auction_id', auctionId);
      
    if (questionsError) {
      console.error('Error deleting auction questions:', questionsError);
    }
    
    // Delete any services related to the auction
    const { error: servicesError } = await supabase
      .from('auction_services')
      .delete()
      .eq('auction_id', auctionId);
      
    if (servicesError) {
      console.error('Error deleting auction services:', servicesError);
    }
    
    // Finally delete the auction
    const { error: deleteAuctionError } = await supabase
      .from('auctions')
      .delete()
      .eq('id', auctionId);
      
    if (deleteAuctionError) {
      console.error('Error deleting auction:', deleteAuctionError);
      toast.error('Failed to delete auction');
      return false;
    }
    
    console.log('Auction deleted successfully');
    
    // If there's an associated vehicle, delete it too
    if (vehicleId) {
      // Finally delete the vehicle
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);
        
      if (vehicleError) {
        console.error('Error deleting vehicle:', vehicleError);
        toast.error('Vehicle could not be deleted');
        // We still return true since the auction was deleted
      }
    }
    
    toast.success('Auction deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to delete auction');
    return false;
  }
}
