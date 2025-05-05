
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminVehicle } from './types';

// Vehicle management functions
export async function getVehicles() {
  try {
    console.log('Admin service: Fetching all vehicles...');
    
    // First get all approved vehicles
    const { data: approvedVehicles, error: approvedError } = await supabase
      .from('vehicles')
      .select('*, auctions(*)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
      
    if (approvedError) {
      console.error('Error fetching approved vehicles:', approvedError);
      return { vehicles: [] };
    }
    
    // Then get all vehicles with pending approval auctions
    const { data: pendingVehicles, error: pendingError } = await supabase
      .from('vehicles')
      .select('*, auctions(*)')
      .eq('auctions.status', 'pending_approval')
      .order('created_at', { ascending: false });
    
    if (pendingError) {
      console.error('Error fetching pending vehicles:', pendingError);
      return { vehicles: [] };
    }
    
    // Combine both results, removing duplicates (a vehicle might be approved AND have a pending auction)
    const allVehiclesData = [...(approvedVehicles || []), ...(pendingVehicles || [])];
    
    // Remove duplicates by using Map with vehicle id as key
    const uniqueVehiclesMap = new Map();
    allVehiclesData.forEach(vehicle => {
      uniqueVehiclesMap.set(vehicle.id, vehicle);
    });
    
    const vehiclesData = Array.from(uniqueVehiclesMap.values());
    
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
    console.log('Admin service: Attempting to delete vehicle:', vehicleId);
    
    // First delete any auctions related to this vehicle
    const { error: auctionsError } = await supabase
      .from('auctions')
      .delete()
      .eq('vehicle_id', vehicleId);
      
    if (auctionsError) {
      console.error('Error deleting related auctions:', auctionsError);
      // Continue with deletion process even if auction deletion fails
    }
    
    // Delete vehicle features
    const { error: featuresError } = await supabase
      .from('vehicle_features')
      .delete()
      .eq('vehicle_id', vehicleId);
      
    if (featuresError) {
      console.error('Error deleting vehicle features:', featuresError);
      // Continue with deletion process
    }
    
    // Delete vehicle photos
    const { error: photosError } = await supabase
      .from('vehicle_photos')
      .delete()
      .eq('vehicle_id', vehicleId);
      
    if (photosError) {
      console.error('Error deleting vehicle photos:', photosError);
      // Continue with deletion process
    }
    
    // Finally delete the vehicle itself
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
