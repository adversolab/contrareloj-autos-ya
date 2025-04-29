
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AdminVehicle } from './types';

// Vehicle management functions
export async function getVehicles() {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        user:user_id (
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener vehículos:', error);
      toast({ title: "Error", description: "No se pudieron cargar los vehículos", variant: "destructive" });
      return { vehicles: [] };
    }
    
    // Process and validate the data to ensure it matches our AdminVehicle type
    const vehicles: AdminVehicle[] = data.map(vehicle => {
      // Handle case where user might be a SelectQueryError
      const userInfo = typeof vehicle.user === 'object' && vehicle.user && !('error' in vehicle.user) 
        ? vehicle.user 
        : { email: 'unknown@email.com', first_name: null, last_name: null };

      return {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        user_id: vehicle.user_id,
        is_approved: vehicle.is_approved || false,
        created_at: vehicle.created_at,
        user: {
          email: userInfo.email || 'unknown@email.com',
          first_name: userInfo.first_name,
          last_name: userInfo.last_name
        }
      };
    });
    
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
