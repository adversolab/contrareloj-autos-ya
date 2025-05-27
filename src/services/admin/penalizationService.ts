
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { executePenalizationProcess, confirmAuctionPurchase } from '@/services/creditService';

export interface PendingPenalization {
  auction_id: string;
  winner_id: string;
  winner_email: string;
  winner_name: string;
  vehicle_info: string;
  end_date: string;
  hours_overdue: number;
}

// Obtener subastas pendientes de penalización
export async function getPendingPenalizations(): Promise<{ penalizations: PendingPenalization[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        id,
        winner_id,
        end_date,
        vehicles(brand, model, year),
        profiles!winner_id(email, first_name, last_name)
      `)
      .eq('status', 'finished')
      .eq('purchase_confirmed', false)
      .eq('penalized', false)
      .not('winner_id', 'is', null);

    if (error) {
      console.error('Error al obtener penalizaciones pendientes:', error);
      return { penalizations: [], error: 'Error al obtener penalizaciones pendientes' };
    }

    const penalizations: PendingPenalization[] = (data || []).map((auction: any) => {
      const endDate = new Date(auction.end_date);
      const now = new Date();
      const hoursOverdue = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60));
      
      return {
        auction_id: auction.id,
        winner_id: auction.winner_id,
        winner_email: auction.profiles?.email || 'Sin email',
        winner_name: `${auction.profiles?.first_name || ''} ${auction.profiles?.last_name || ''}`.trim() || 'Sin nombre',
        vehicle_info: `${auction.vehicles?.brand || ''} ${auction.vehicles?.model || ''} ${auction.vehicles?.year || ''}`,
        end_date: auction.end_date,
        hours_overdue: hoursOverdue
      };
    });

    return { penalizations };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { penalizations: [], error: 'Error inesperado' };
  }
}

// Ejecutar proceso de penalizaciones automáticas
export async function runAutomaticPenalizations(): Promise<{ success: boolean; penalizedUsers?: number; error?: string }> {
  try {
    const result = await executePenalizationProcess();
    
    if (result.success) {
      toast.success(`Proceso completado. ${result.penalizedUsers || 0} usuarios penalizados.`);
    } else {
      toast.error(result.error || 'Error al ejecutar penalizaciones');
    }
    
    return result;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error inesperado al ejecutar penalizaciones');
    return { success: false, error: 'Error inesperado' };
  }
}

// Confirmar compra manualmente (para administradores)
export async function adminConfirmPurchase(auctionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await confirmAuctionPurchase(auctionId);
    
    if (result.success) {
      toast.success('Compra confirmada correctamente');
    } else {
      toast.error(result.error || 'Error al confirmar compra');
    }
    
    return result;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error inesperado al confirmar compra');
    return { success: false, error: 'Error inesperado' };
  }
}

// Obtener estadísticas de penalizaciones
export async function getPenalizationStats(): Promise<{ 
  total_penalized: number; 
  blocked_users: number; 
  pending_penalizations: number; 
  error?: string 
}> {
  try {
    // Obtener total de usuarios penalizados
    const { count: totalPenalized } = await supabase
      .from('auctions')
      .select('*', { count: 'exact', head: true })
      .eq('penalized', true);

    // Obtener usuarios bloqueados
    const { count: blockedUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('blocked', true);

    // Obtener penalizaciones pendientes
    const { count: pendingPenalizations } = await supabase
      .from('auctions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'finished')
      .eq('purchase_confirmed', false)
      .eq('penalized', false)
      .not('winner_id', 'is', null);

    return {
      total_penalized: totalPenalized || 0,
      blocked_users: blockedUsers || 0,
      pending_penalizations: pendingPenalizations || 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      total_penalized: 0,
      blocked_users: 0,
      pending_penalizations: 0,
      error: 'Error al obtener estadísticas'
    };
  }
}
