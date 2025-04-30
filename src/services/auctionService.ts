
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminAuction } from "./admin/types";

export async function getAuctions() {
  try {
    // Primero obtenemos las subastas
    const { data: auctions, error: auctionsError } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles(*)
      `)
      .order('created_at', { ascending: false });
      
    if (auctionsError) {
      console.error('Error al obtener subastas:', auctionsError);
      toast.error('Error al cargar las subastas');
      return { auctions: [] };
    }
    
    // Obtener los IDs de usuarios desde los vehículos
    const userIds = auctions
      .map(auction => auction.vehicles?.user_id)
      .filter(Boolean);
      
    // Obtener información de usuarios por separado
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('Error al obtener perfiles de usuarios:', profilesError);
      // Continuamos con las subastas sin información de usuario
    }
    
    // Crear un mapa de perfiles para búsqueda rápida
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }
    
    // Formatear subastas
    const formattedAuctions: AdminAuction[] = auctions.map(auction => {
      const vehicle = auction.vehicles;
      const profile = vehicle ? profileMap.get(vehicle.user_id) : null;
      
      return {
        id: auction.id,
        start_price: auction.start_price,
        reserve_price: auction.reserve_price,
        status: auction.status,
        vehicle_id: auction.vehicle_id,
        is_approved: auction.is_approved || false,
        created_at: auction.created_at,
        vehicle: {
          brand: vehicle ? vehicle.brand || 'Desconocida' : 'Desconocida',
          model: vehicle ? vehicle.model || 'Desconocido' : 'Desconocido',
          year: vehicle ? vehicle.year || 0 : 0,
          autofact_report_url: vehicle ? vehicle.autofact_report_url : undefined
        },
        user: {
          email: profile ? (profile.email || 'Sin correo') : 'Sin correo',
          first_name: profile ? profile.first_name : undefined,
          last_name: profile ? profile.last_name : undefined
        }
      };
    });
    
    return { auctions: formattedAuctions };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al cargar las subastas');
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
      console.error('Error al obtener información de la subasta:', fetchError);
      toast.error('Error al obtener información de la subasta');
      return false;
    }
    
    // Calcular fechas para la subasta activa
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (auction?.duration_days || 7)); // Usar duración definida o 7 días por defecto
    
    // Actualizar la subasta: aprobarla y cambiar el estado a active
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
      console.error('Error al aprobar subasta:', error);
      toast.error('Error al aprobar la subasta');
      return false;
    }
    
    toast.success('Subasta aprobada y activada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al aprobar la subasta');
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
      console.error('Error al pausar subasta:', error);
      toast.error('Error al pausar la subasta');
      return false;
    }
    
    toast.success('Subasta pausada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al pausar la subasta');
    return false;
  }
}

export async function deleteAuction(auctionId: string) {
  try {
    // Primero obtener el ID del vehículo asociado
    const { data: auction, error: fetchError } = await supabase
      .from('auctions')
      .select('vehicle_id')
      .eq('id', auctionId)
      .single();
      
    if (fetchError) {
      console.error('Error al obtener información de la subasta:', fetchError);
      toast.error('Error al obtener información de la subasta');
      return false;
    }
    
    const vehicleId = auction?.vehicle_id;
    
    // Eliminar la subasta
    const { error: deleteAuctionError } = await supabase
      .from('auctions')
      .delete()
      .eq('id', auctionId);
      
    if (deleteAuctionError) {
      console.error('Error al eliminar subasta:', deleteAuctionError);
      toast.error('Error al eliminar la subasta');
      return false;
    }
    
    // Si hay vehículo asociado, también lo eliminamos
    if (vehicleId) {
      // Eliminar características del vehículo
      await supabase
        .from('vehicle_features')
        .delete()
        .eq('vehicle_id', vehicleId);
        
      // Eliminar fotos del vehículo
      await supabase
        .from('vehicle_photos')
        .delete()
        .eq('vehicle_id', vehicleId);
        
      // Finalmente eliminar el vehículo
      await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);
    }
    
    toast.success('Subasta eliminada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al eliminar la subasta');
    return false;
  }
}

// Export toast to avoid import issues
export { toast } from "sonner";
