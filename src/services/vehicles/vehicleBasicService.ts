
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/authService";
import { VehicleBasicInfo, VehicleFeature } from "./types";

// Vehicle management functions
export async function saveVehicleBasicInfo(info: VehicleBasicInfo): Promise<{ success: boolean; vehicleId?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para registrar un vehículo');
      return { success: false };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.id,
        brand: info.brand,
        model: info.model,
        year: parseInt(info.year),
        kilometers: parseInt(info.kilometers.replace(/\D/g, '')),
        fuel: info.fuel,
        transmission: info.transmission,
        description: info.description
      })
      .select()
      .single();

    if (error) {
      console.error('Error al guardar información básica:', error);
      toast.error('Error al guardar la información');
      return { success: false };
    }

    return { success: true, vehicleId: data.id };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la información');
    return { success: false };
  }
}

export async function updateVehicleBasicInfo(vehicleId: string, info: VehicleBasicInfo): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('vehicles')
      .update({
        brand: info.brand,
        model: info.model,
        year: parseInt(info.year),
        kilometers: parseInt(info.kilometers.replace(/\D/g, '')),
        fuel: info.fuel,
        transmission: info.transmission,
        description: info.description
      })
      .eq('id', vehicleId);

    if (error) {
      console.error('Error al actualizar información básica:', error);
      toast.error('Error al actualizar la información');
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la información');
    return { success: false };
  }
}

export async function saveVehicleFeatures(vehicleId: string, features: VehicleFeature[]): Promise<{ success: boolean }> {
  try {
    // First, delete existing features
    await supabase
      .from('vehicle_features')
      .delete()
      .eq('vehicle_id', vehicleId);

    // Then insert new features
    const formattedFeatures = features.map(feature => ({
      vehicle_id: vehicleId,
      category: feature.category,
      feature: feature.feature
    }));

    const { error } = await supabase
      .from('vehicle_features')
      .insert(formattedFeatures);

    if (error) {
      console.error('Error al guardar características:', error);
      toast.error('Error al guardar las características');
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la información');
    return { success: false };
  }
}

export async function deleteVehicleWithAuction(vehicleId: string): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para eliminar un vehículo');
      return { success: false };
    }

    // First, check if the vehicle belongs to the user
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select()
      .eq('id', vehicleId)
      .eq('user_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Error al verificar propiedad del vehículo:', vehicleError);
      toast.error('No tienes permiso para eliminar este vehículo');
      return { success: false };
    }

    // Delete auction first (foreign key constraint)
    const { error: auctionError } = await supabase
      .from('auctions')
      .delete()
      .eq('vehicle_id', vehicleId);

    if (auctionError) {
      console.error('Error al eliminar subasta:', auctionError);
    }

    // Delete vehicle features
    const { error: featuresError } = await supabase
      .from('vehicle_features')
      .delete()
      .eq('vehicle_id', vehicleId);

    if (featuresError) {
      console.error('Error al eliminar características:', featuresError);
    }

    // Delete vehicle photos
    const { error: photosError } = await supabase
      .from('vehicle_photos')
      .delete()
      .eq('vehicle_id', vehicleId);

    if (photosError) {
      console.error('Error al eliminar fotos:', photosError);
    }

    // Finally delete the vehicle
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);

    if (deleteError) {
      console.error('Error al eliminar vehículo:', deleteError);
      toast.error('Error al eliminar el vehículo');
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al eliminar el vehículo');
    return { success: false };
  }
}
