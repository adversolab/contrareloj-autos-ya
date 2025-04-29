
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AdminAuction } from './types';

// Auction management functions
export async function getAuctions() {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicle:vehicle_id (
          brand,
          model,
          year,
          user_id
        ),
        user:vehicle!inner(user_id (
          email,
          first_name,
          last_name
        ))
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener subastas:', error);
      toast({ title: "Error", description: "No se pudieron cargar las subastas", variant: "destructive" });
      return { auctions: [] };
    }
    
    console.log("Raw auction data:", data);
    
    // Process data to match AdminAuction interface with proper type checking
    const auctions: AdminAuction[] = data.map(auction => {
      // Handle the case where vehicle might be a SelectQueryError
      const vehicleInfo = typeof auction.vehicle === 'object' && auction.vehicle && !('error' in auction.vehicle)
        ? auction.vehicle
        : { brand: 'Unknown', model: 'Unknown', year: 0 };
        
      // Default user info
      let userInfo = { email: 'unknown@email.com', first_name: null, last_name: null };
      
      // Handle the complex user structure safely
      if (
        typeof auction.user === 'object' && 
        auction.user !== null
      ) {
        // Check if it's an error object or if it has the expected user data
        if (auction.user && !('error' in auction.user)) {
          // Try to safely extract user email and name
          // Force TypeScript to treat userData as a properly typed object with email and name properties
          const userData = auction.user as { 
            email?: string, 
            first_name?: string | null, 
            last_name?: string | null 
          };
          
          userInfo = {
            email: typeof userData.email === 'string' ? userData.email : 'unknown@email.com',
            first_name: userData.first_name ?? null,
            last_name: userData.last_name ?? null
          };
        }
      }

      return {
        id: auction.id,
        start_price: auction.start_price,
        reserve_price: auction.reserve_price,
        status: auction.status,
        vehicle_id: auction.vehicle_id,
        is_approved: auction.is_approved || false,
        created_at: auction.created_at,
        vehicle: {
          brand: vehicleInfo.brand,
          model: vehicleInfo.model,
          year: vehicleInfo.year
        },
        user: userInfo
      };
    });
    
    return { auctions };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudieron cargar las subastas", variant: "destructive" });
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
      toast({ title: "Error", description: "No se pudo aprobar la subasta", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Subasta aprobada correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo aprobar la subasta", variant: "destructive" });
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
      console.error('Error al eliminar subasta:', error);
      toast({ title: "Error", description: "No se pudo eliminar la subasta", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Subasta eliminada correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo eliminar la subasta", variant: "destructive" });
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
      toast({ title: "Error", description: "No se pudo pausar la subasta", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Subasta pausada correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo pausar la subasta", variant: "destructive" });
    return false;
  }
}
