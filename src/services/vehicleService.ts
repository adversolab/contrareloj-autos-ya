
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

export interface VehicleBasicInfo {
  brand: string;
  model: string;
  year: string;
  kilometers: string;
  fuel: string;
  transmission: string;
  description: string;
}

export interface VehicleFeature {
  category: string;
  feature: string;
}

export interface AuctionInfo {
  reservePrice: number;
  startPrice: number;
  durationDays: number;
  minIncrement: number;
  services: string[];
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
        vehicle_id (
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
      const vehicle = favorite.vehicle_id;
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
        auction_id: vehicleId
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

// Add the missing functions for submitting and answering questions

/**
 * Submit a question for an auction
 */
export async function submitQuestion(auctionId: string, question: string): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para hacer una pregunta');
      return { success: false };
    }

    const { error } = await supabase
      .from('auction_questions')
      .insert({
        auction_id: auctionId,
        user_id: user.id,
        question: question
      });

    if (error) {
      console.error('Error submitting question:', error);
      toast.error('Error al enviar la pregunta');
      return { success: false };
    }

    toast.success('Pregunta enviada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error submitting question:', error);
    toast.error('Error al enviar la pregunta');
    return { success: false };
  }
}

/**
 * Answer a question for an auction
 */
export async function answerQuestion(questionId: string, answer: string): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para responder');
      return { success: false };
    }

    const { error } = await supabase
      .from('auction_questions')
      .update({
        answer: answer,
        is_answered: true,
        answered_at: new Date().toISOString()
      })
      .eq('id', questionId);

    if (error) {
      console.error('Error answering question:', error);
      toast.error('Error al responder la pregunta');
      return { success: false };
    }

    toast.success('Respuesta enviada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error answering question:', error);
    toast.error('Error al responder la pregunta');
    return { success: false };
  }
}

// Add the missing functions for auction and vehicle management

export async function saveVehicleBasicInfo(info: VehicleBasicInfo): Promise<{ success: boolean, vehicleId?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false };
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.id,
        brand: info.brand,
        model: info.model,
        year: parseInt(info.year),
        kilometers: parseInt(info.kilometers),
        fuel: info.fuel,
        transmission: info.transmission,
        description: info.description
      })
      .select();

    if (error || !data || data.length === 0) {
      console.error('Error saving vehicle info:', error);
      return { success: false };
    }

    return { success: true, vehicleId: data[0].id };
  } catch (error) {
    console.error('Error saving vehicle info:', error);
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
        kilometers: parseInt(info.kilometers),
        fuel: info.fuel,
        transmission: info.transmission,
        description: info.description
      })
      .eq('id', vehicleId);

    if (error) {
      console.error('Error updating vehicle info:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating vehicle info:', error);
    return { success: false };
  }
}

export async function saveVehicleFeatures(vehicleId: string, features: VehicleFeature[]): Promise<{ success: boolean }> {
  try {
    // First delete existing features
    await supabase
      .from('vehicle_features')
      .delete()
      .eq('vehicle_id', vehicleId);

    // Then insert new features
    if (features.length > 0) {
      const featuresToInsert = features.map(feature => ({
        vehicle_id: vehicleId,
        category: feature.category,
        feature: feature.feature
      }));

      const { error } = await supabase
        .from('vehicle_features')
        .insert(featuresToInsert);

      if (error) {
        console.error('Error saving vehicle features:', error);
        return { success: false };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving vehicle features:', error);
    return { success: false };
  }
}

interface PhotoUploadOptions {
  file: File;
  isMain: boolean;
  position: number;
}

export async function uploadVehiclePhoto(vehicleId: string, options: PhotoUploadOptions): Promise<{ success: boolean, url?: string }> {
  try {
    const { file, isMain, position } = options;
    const fileExt = file.name.split('.').pop();
    const fileName = `${vehicleId}_${position}_${Date.now()}.${fileExt}`;
    const filePath = `vehicles/${vehicleId}/${fileName}`;

    // Upload the photo to storage
    const { error: uploadError } = await supabase.storage
      .from('vehicle_photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading vehicle photo:', uploadError);
      return { success: false };
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('vehicle_photos')
      .getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      return { success: false };
    }

    // Save to the database
    const { error } = await supabase
      .from('vehicle_photos')
      .insert({
        vehicle_id: vehicleId,
        url: data.publicUrl,
        is_primary: isMain,
        position: position
      });

    if (error) {
      console.error('Error saving vehicle photo:', error);
      return { success: false };
    }

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Error uploading vehicle photo:', error);
    return { success: false };
  }
}

export async function uploadAutofactReport(vehicleId: string, file: File): Promise<{ success: boolean, url?: string }> {
  try {
    const fileName = `report_${vehicleId}_${Date.now()}.pdf`;
    const filePath = `reports/${fileName}`;

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('vehicle_reports')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading report:', uploadError);
      return { success: false };
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('vehicle_reports')
      .getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      return { success: false };
    }

    // Update vehicle with report URL
    const { error } = await supabase
      .from('vehicles')
      .update({
        report_url: data.publicUrl
      })
      .eq('id', vehicleId);

    if (error) {
      console.error('Error saving report URL:', error);
      return { success: false };
    }

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Error uploading report:', error);
    return { success: false };
  }
}

export async function saveAuctionInfo(vehicleId: string, info: AuctionInfo): Promise<{ success: boolean, auctionId?: string }> {
  try {
    // Check if auction already exists
    const { data: existingAuctions } = await supabase
      .from('auctions')
      .select('id')
      .eq('vehicle_id', vehicleId);

    let auctionId;

    if (existingAuctions && existingAuctions.length > 0) {
      // Update existing auction
      auctionId = existingAuctions[0].id;
      const { error } = await supabase
        .from('auctions')
        .update({
          reserve_price: info.reservePrice,
          start_price: info.startPrice,
          min_increment: info.minIncrement,
          duration_days: info.durationDays
        })
        .eq('id', auctionId);

      if (error) {
        console.error('Error updating auction:', error);
        return { success: false };
      }
    } else {
      // Create new auction
      const { data, error } = await supabase
        .from('auctions')
        .insert({
          vehicle_id: vehicleId,
          reserve_price: info.reservePrice,
          start_price: info.startPrice,
          min_increment: info.minIncrement,
          duration_days: info.durationDays,
          status: 'draft'
        })
        .select();

      if (error || !data || data.length === 0) {
        console.error('Error creating auction:', error);
        return { success: false };
      }

      auctionId = data[0].id;
    }

    // Handle services
    if (info.services && info.services.length > 0) {
      // First delete existing services
      await supabase
        .from('auction_services')
        .delete()
        .eq('auction_id', auctionId);

      // Then add new services
      const servicesToInsert = info.services.map(service => ({
        auction_id: auctionId,
        service_type: service,
        price: 0 // Price would be set based on service type
      }));

      if (servicesToInsert.length > 0) {
        const { error } = await supabase
          .from('auction_services')
          .insert(servicesToInsert);

        if (error) {
          console.error('Error saving services:', error);
          return { success: false, auctionId };
        }
      }
    }

    return { success: true, auctionId };
  } catch (error) {
    console.error('Error saving auction info:', error);
    return { success: false };
  }
}

export async function activateAuction(auctionId: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('auctions')
      .update({
        status: 'pending_approval'
      })
      .eq('id', auctionId);

    if (error) {
      console.error('Error activating auction:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error activating auction:', error);
    return { success: false };
  }
}

// Functions for auction detail page
export async function getAuctionById(auctionId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles (
          *,
          vehicle_photos (*)
        )
      `)
      .eq('id', auctionId)
      .single();

    if (error) {
      console.error('Error fetching auction:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching auction:', error);
    return null;
  }
}

export async function getAuctionQuestions(auctionId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('auction_questions')
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
  }
}

export async function getAuctionBids(auctionId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select(`
        *,
        profiles:user_id (first_name, last_name)
      `)
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false });

    if (error) {
      console.error('Error fetching bids:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching bids:', error);
    return [];
  }
}

export async function placeBid(auctionId: string, amount: number): Promise<{ success: boolean, message: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Debes iniciar sesión para ofertar' };
    }

    // Check if user is verified
    const { data: profile } = await supabase
      .from('profiles')
      .select('identity_verified')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.identity_verified) {
      return {
        success: false,
        message: 'Debes verificar tu identidad para ofertar'
      };
    }

    // Insert the bid
    const { error } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        user_id: user.id,
        amount: amount,
        hold_amount: amount * 0.10 // 10% hold amount
      });

    if (error) {
      console.error('Error placing bid:', error);
      return { success: false, message: 'Error al realizar la oferta' };
    }

    // Update auction current price
    await supabase
      .from('auctions')
      .update({
        current_price: amount
      })
      .eq('id', auctionId);

    return { success: true, message: '¡Oferta realizada con éxito!' };
  } catch (error) {
    console.error('Error placing bid:', error);
    return { success: false, message: 'Error al realizar la oferta' };
  }
}

export async function finalizeAuction(auctionId: string): Promise<{ success: boolean }> {
  try {
    // This would be triggered by an admin or a cron job
    const { error } = await supabase
      .from('auctions')
      .update({
        status: 'completed'
      })
      .eq('id', auctionId);

    if (error) {
      console.error('Error finalizing auction:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error finalizing auction:', error);
    return { success: false };
  }
}

// Identity verification
export async function updateRutInfo(rut: string): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ rut })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating RUT:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating RUT:', error);
    return { success: false };
  }
}

export async function getVerificationStatus(): Promise<{ isVerified: boolean, rut: string | null }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { isVerified: false, rut: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('identity_verified, rut')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('Error checking verification status:', error);
      return { isVerified: false, rut: null };
    }

    return {
      isVerified: data.identity_verified || false,
      rut: data.rut
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return { isVerified: false, rut: null };
  }
}
