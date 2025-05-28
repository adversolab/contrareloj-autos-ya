
import { supabase } from '@/integrations/supabase/client';
import { processCreditsMovement } from '@/services/creditService';
import { toast } from 'sonner';

export interface FeaturedVehicle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  featured: boolean;
}

export const getFeaturedVehicles = async (): Promise<{ vehicles: FeaturedVehicle[] }> => {
  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        brand,
        model,
        year,
        description,
        destacado,
        auctions!inner(
          id,
          start_price,
          end_date,
          status
        )
      `)
      .eq('destacado', true)
      .eq('auctions.status', 'active')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching featured vehicles:', error);
      return { vehicles: [] };
    }

    // Transform the data and get photos for each vehicle
    const vehiclesWithPhotos = await Promise.all(
      (vehicles || []).map(async (vehicle) => {
        // Get the primary photo
        const { data: photos } = await supabase
          .from('vehicle_photos')
          .select('url')
          .eq('vehicle_id', vehicle.id)
          .eq('is_primary', true)
          .limit(1);

        const auction = Array.isArray(vehicle.auctions) ? vehicle.auctions[0] : vehicle.auctions;

        return {
          id: vehicle.id,
          title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
          description: vehicle.description || '',
          imageUrl: photos && photos.length > 0 ? photos[0].url : '/placeholder.svg',
          currentBid: auction?.start_price || 0,
          endTime: auction?.end_date ? new Date(auction.end_date) : new Date(),
          bidCount: 0, // Default value since we don't track this yet
          featured: vehicle.destacado
        };
      })
    );

    return { vehicles: vehiclesWithPhotos };
  } catch (error) {
    console.error('Error in getFeaturedVehicles:', error);
    return { vehicles: [] };
  }
};

export const highlightVehicle = async (
  vehicleId: string, 
  deductCredits: boolean = true
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Only deduct credits if explicitly requested (when highlighting separately)
    if (deductCredits) {
      // Get vehicle info for the credit movement description
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('brand, model, year')
        .eq('id', vehicleId)
        .single();

      const vehicleTitle = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'vehículo';
      
      const creditResult = await processCreditsMovement(
        'destacar',
        -25,
        `Destacar publicación de ${vehicleTitle}`
      );

      if (!creditResult.success) {
        if (creditResult.error?.includes('Saldo insuficiente')) {
          toast.error('No tienes créditos suficientes para destacar este vehículo');
          return { success: false, error: 'insufficient_credits' };
        }
        toast.error('Error al procesar los créditos');
        return { success: false, error: creditResult.error };
      }
    }

    // Mark vehicle as highlighted
    const { error } = await supabase
      .from('vehicles')
      .update({ destacado: true })
      .eq('id', vehicleId);

    if (error) {
      console.error('Error highlighting vehicle:', error);
      return { success: false, error: error.message };
    }

    if (deductCredits) {
      toast.success('Vehículo destacado exitosamente');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in highlightVehicle:', error);
    return { success: false, error: 'Error inesperado' };
  }
};

export const removeHighlight = async (vehicleId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('vehicles')
      .update({ destacado: false })
      .eq('id', vehicleId);

    if (error) {
      console.error('Error removing highlight:', error);
      return { success: false, error: error.message };
    }

    toast.success('Destacado removido exitosamente');
    return { success: true };
  } catch (error) {
    console.error('Error in removeHighlight:', error);
    return { success: false, error: 'Error inesperado' };
  }
};
