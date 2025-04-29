
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AdminVehicle } from './types';

// Vehicle management functions
export async function getVehicles() {
  try {
    // First get all vehicles
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (vehiclesError) {
      console.error('Error al obtener vehículos:', vehiclesError);
      toast({ title: "Error", description: "No se pudieron cargar los vehículos", variant: "destructive" });
      return { vehicles: [] };
    }

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
    
    return { vehicles };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudieron cargar los vehículos", variant: "destructive" });
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
      console.error('Error al aprobar vehículo:', error);
      toast({ title: "Error", description: "No se pudo aprobar el vehículo", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Vehículo aprobado correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo aprobar el vehículo", variant: "destructive" });
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
      console.error('Error al eliminar vehículo:', error);
      toast({ title: "Error", description: "No se pudo eliminar el vehículo", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Vehículo eliminado correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo eliminar el vehículo", variant: "destructive" });
    return false;
  }
}
