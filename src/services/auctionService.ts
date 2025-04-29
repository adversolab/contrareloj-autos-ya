
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminAuction } from "./types/adminTypes";

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
          year: vehicle ? vehicle.year || 0 : 0
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
    const { error } = await supabase
      .from('auctions')
      .update({ is_approved: true })
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error al aprobar subasta:', error);
      toast.error('Error al aprobar la subasta');
      return false;
    }
    
    toast.success('Subasta aprobada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al aprobar la subasta');
    return false;
  }
}
