
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminVehicle } from './types';

// Vehicle management functions
export async function getVehicles() {
  try {
    console.log('Admin service: Fetching all vehicles...');
    
    // First get all vehicles that either:
    // 1. Have an associated auction with status 'pending_approval' or
    // 2. Have been previously approved
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*, auctions(*)')
      .or('is_approved.eq.true,auctions.status.eq.pending_approval')
      .order('created_at', { ascending: false });
      
    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError);
      toast.error('Failed to load vehicles');
      return { vehicles: [] };
    }

    console.log('Admin service: Number of vehicles returned:', vehiclesData ? vehiclesData.length : 0);

    // Then get user information for each vehicle
    const vehicles: AdminVehicle[] = [];
    
    for (const vehicle of vehiclesData) {
      // Get user info if user_id exists
      let userInfo = { email: 'unknown@email.com', first_name: null, last_name: null };
      
      if (vehicle.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', vehicle.user_id)
          .single();
          
        if (!userError && userData) {
          userInfo = {
            email: userData.email || 'unknown@email.com',
            first_name: userData.first_name,
            last_name: userData.last_name
          };
        }
      }
      
      vehicles.push({
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        user_id: vehicle.user_id,
        is_approved: vehicle.is_approved || false,
        created_at: vehicle.created_at,
        user: userInfo
      });
    }
    
    console.log("Admin service: Total vehicles found:", vehicles.length);
    return { vehicles };
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to load vehicles');
    return { vehicles: [] };
  }
}

export async function approveVehicle(vehicleId: string) {
  try {
    const { error } = await supabase
      .from('vehicles')
      .update({ is_approved: true })
      .eq('id', vehicleId);
      
    if (error) {
      console.error('Error approving vehicle:', error);
      toast.error('Failed to approve the vehicle');
      return false;
    }
    
    toast.success('Vehicle approved successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to approve the vehicle');
    return false;
  }
}

export async function deleteVehicle(vehicleId: string) {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);
      
    if (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete the vehicle');
      return false;
    }
    
    toast.success('Vehicle deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to delete the vehicle');
    return false;
  }
}
