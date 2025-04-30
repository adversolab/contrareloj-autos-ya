
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/authService";
import { VehicleWithPhoto } from "./types";

export async function getUserVehicles() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { vehicles: [], error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        auctions(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener vehículos:', error);
      return { vehicles: [], error: error.message };
    }

    // Try to load first photo for each vehicle
    const vehiclesWithPhotos: VehicleWithPhoto[] = await Promise.all(
      data.map(async (vehicle) => {
        const { data: photos } = await supabase
          .from('vehicle_photos')
          .select('url')
          .eq('vehicle_id', vehicle.id)
          .eq('is_primary', true)
          .limit(1);
        
        return {
          ...vehicle,
          photo_url: photos && photos.length > 0 ? photos[0].url : undefined
        } as VehicleWithPhoto;
      })
    );

    return { vehicles: vehiclesWithPhotos, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { vehicles: [], error: 'Error al cargar vehículos' };
  }
}

export async function getUserFavorites() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { favorites: [], error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        auction_id,
        auctions(
          id,
          start_price,
          end_date,
          vehicles(
            id,
            brand,
            model,
            year,
            description
          )
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al obtener favoritos:', error);
      return { favorites: [], error: error.message };
    }

    // For each favorite, get the primary photo of the vehicle
    const favoritesWithPhotos = await Promise.all(
      data.map(async (fav) => {
        // Fix: Check if auctions and vehicles exist and have an id property
        if (!fav.auctions?.vehicles?.id) {
          return fav;
        }
        
        // We need to safely access the vehicle id
        const vehicleId = fav.auctions.vehicles.id;

        const { data: photos } = await supabase
          .from('vehicle_photos')
          .select('url')
          .eq('vehicle_id', vehicleId)
          .eq('is_primary', true)
          .limit(1);

        return {
          ...fav,
          auctions: {
            ...fav.auctions,
            vehicles: {
              ...fav.auctions.vehicles,
              photo_url: photos && photos.length > 0 ? photos[0].url : undefined
            }
          }
        };
      })
    );

    // Format favorites data
    const formattedFavorites = favoritesWithPhotos.map(fav => {
      if (!fav.auctions) {
        return null;
      }
      
      // Fix: Safely access photo_url property with optional chaining
      const photoUrl = fav.auctions.vehicles?.photo_url;
      
      return {
        id: fav.auctions.id,
        title: `${fav.auctions.vehicles?.brand || ''} ${fav.auctions.vehicles?.model || ''} ${fav.auctions.vehicles?.year || ''}`.trim(),
        description: fav.auctions.vehicles?.description || '',
        imageUrl: photoUrl || '/placeholder.svg',
        currentBid: fav.auctions.start_price || 0,
        endTime: fav.auctions.end_date ? new Date(fav.auctions.end_date) : new Date(),
        bidCount: 0, // Default since we don't have this info
      };
    }).filter(Boolean);

    return { favorites: formattedFavorites, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { favorites: [], error: 'Error al cargar favoritos' };
  }
}

export async function getVehicleDetails(vehicleId: string) {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        auctions(*)
      `)
      .eq('id', vehicleId)
      .single();

    if (error) {
      console.error('Error al obtener detalles del vehículo:', error);
      return { vehicle: null, error };
    }

    // Get photos
    const { data: photos } = await supabase
      .from('vehicle_photos')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('position', { ascending: true });

    // Get features
    const { data: features } = await supabase
      .from('vehicle_features')
      .select('*')
      .eq('vehicle_id', vehicleId);

    return { 
      vehicle: data, 
      photos: photos || [],
      features: features || [],
      error: null 
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { 
      vehicle: null, 
      photos: [],
      features: [],
      error 
    };
  }
}
