import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "./authService";

export interface VehicleWithPhoto {
  id: string;
  brand: string;
  model: string;
  year: number;
  description: string;
  photo_url: string;
  created_at: string;
  user_id: string;
  is_approved: boolean;
  auctions: any[];
}

export async function getUserVehicles(): Promise<{ vehicles: any[], drafts: any[], error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { vehicles: [], drafts: [], error: 'User not authenticated' };
    }

    // Get all vehicles for the user
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        auctions (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching vehicles:', error);
      return { vehicles: [], drafts: [], error: error.message };
    }

    // Separate vehicles into approved and draft
    const approvedVehicles = vehicles.filter(vehicle => 
      vehicle.auctions && 
      vehicle.auctions.length > 0 && 
      vehicle.auctions[0].status !== 'draft'
    );

    const draftVehicles = vehicles.filter(vehicle => 
      !vehicle.auctions || 
      vehicle.auctions.length === 0 || 
      vehicle.auctions[0].status === 'draft'
    );

    // Return both vehicles and draft vehicles
    return { vehicles: approvedVehicles || [], drafts: draftVehicles || [], error: null };
  } catch (error) {
    console.error('Error getting user vehicles:', error);
    return { vehicles: [], drafts: [], error: 'Error getting vehicles' };
  }
}

export async function getUserFavorites(): Promise<{ favorites: any[], error: string | null }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { favorites: [], error: 'User not authenticated' };
    }

    // Get user favorites
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        *,
        vehicles (
          *,
          auctions (*)
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
      return { favorites: [], error: error.message };
    }

    // Transform the data to match the expected format
    const formattedFavorites = favorites.map(favorite => {
      const vehicle = favorite.vehicles;
      const auction = vehicle.auctions && vehicle.auctions.length > 0 ? vehicle.auctions[0] : null;
      
      return {
        id: vehicle.id,
        title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        description: vehicle.description || '',
        imageUrl: vehicle.photo_url || '/placeholder.svg',
        currentBid: auction ? auction.current_price || auction.start_price : 0,
        endTime: auction ? new Date(auction.end_date) : new Date(),
        bidCount: auction ? auction.bid_count || 0 : 0
      };
    });

    return { favorites: formattedFavorites, error: null };
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return { favorites: [], error: 'Error getting favorites' };
  }
}

export async function addToFavorites(vehicleId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return false;
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        vehicle_id: vehicleId
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
        toast.error('Este vehículo ya está en tus favoritos');
      } else {
        console.error('Error adding to favorites:', error);
        toast.error('Error al guardar en favoritos');
      }
      return false;
    }

    toast.success('Añadido a favoritos');
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    toast.error('Error al guardar en favoritos');
    return false;
  }
}

export async function removeFromFavorites(vehicleId: string): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicleId);

    if (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Error al eliminar de favoritos');
      return false;
    }

    toast.success('Eliminado de favoritos');
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    toast.error('Error al eliminar de favoritos');
    return false;
  }
}

export async function isFavorite(vehicleId: string): Promise<{ isFavorite: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { isFavorite: false };
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('vehicle_id', vehicleId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking favorite status:', error);
      return { isFavorite: false };
    }

    return { isFavorite: !!data };
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { isFavorite: false };
  }
}
