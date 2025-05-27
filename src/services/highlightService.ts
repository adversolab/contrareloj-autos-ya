
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { processCreditsMovement } from './creditService';
import { getCurrentUser } from './authService';

export async function highlightVehicle(vehicleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // Verificar que el vehículo pertenece al usuario
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return { success: false, error: 'Vehículo no encontrado o no tienes permisos' };
    }

    // Verificar que no esté ya destacado
    if (vehicle.destacado) {
      return { success: false, error: 'Este vehículo ya está destacado' };
    }

    // Descontar créditos
    const creditResult = await processCreditsMovement(
      'destacar',
      -25,
      `Destacó publicación del ${vehicle.brand} ${vehicle.model} ${vehicle.year}`
    );

    if (!creditResult.success) {
      if (creditResult.error?.includes('Saldo insuficiente')) {
        toast.error('No tienes créditos suficientes para destacar esta publicación. Compra créditos aquí.');
        return { success: false, error: 'insufficient_credits' };
      }
      return { success: false, error: creditResult.error };
    }

    // Marcar vehículo como destacado
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ destacado: true })
      .eq('id', vehicleId);

    if (updateError) {
      console.error('Error al destacar vehículo:', updateError);
      return { success: false, error: 'Error al destacar el vehículo' };
    }

    toast.success('¡Vehículo destacado exitosamente!');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

export async function getFeaturedVehicles() {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        auctions(
          id,
          start_price,
          status,
          start_date,
          end_date
        )
      `)
      .eq('destacado', true)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener vehículos destacados:', error);
      return { vehicles: [], error: error.message };
    }

    // Get primary photos for each vehicle
    const vehicleIds = data.map(vehicle => vehicle.id);
    const { data: photosData } = await supabase
      .from('vehicle_photos')
      .select('*')
      .in('vehicle_id', vehicleIds)
      .eq('is_primary', true);

    // Create a map of photos by vehicle
    const photoMap = new Map();
    if (photosData) {
      photosData.forEach(photo => {
        photoMap.set(photo.vehicle_id, photo.url);
      });
    }

    // Format data
    const formattedVehicles = data.map(vehicle => ({
      id: vehicle.id,
      title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      description: vehicle.description || '',
      imageUrl: photoMap.get(vehicle.id) || '/placeholder.svg',
      currentBid: vehicle.auctions?.[0]?.start_price || 0,
      endTime: vehicle.auctions?.[0]?.end_date ? new Date(vehicle.auctions[0].end_date) : new Date(),
      bidCount: 0, // Default value
      featured: true
    }));

    return { vehicles: formattedVehicles, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { vehicles: [], error: 'Error al cargar vehículos destacados' };
  }
}
