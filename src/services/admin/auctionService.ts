
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
    const { error } = await supabase
      .from('auctions')
      .update({ is_approved: true, status: 'approved' })
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error approving auction:', error);
      toast.error('Failed to approve the auction');
      return false;
    }
    
    toast.success('Auction approved successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to approve the auction');
    return false;
  }
}

export async function pauseAuction(auctionId: string) {
  try {
    const { error } = await supabase
      .from('auctions')
      .update({ status: 'paused' })
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error pausing auction:', error);
      toast.error('Failed to pause the auction');
      return false;
    }
    
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
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error deleting auction:', error);
      toast.error('Failed to delete the auction');
      return false;
    }
    
    toast.success('Auction deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to delete the auction');
    return false;
  }
}
