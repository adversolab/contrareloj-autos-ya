
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminVehicle } from "./types/adminTypes";

// Types definitions
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

export interface PhotoUploadParams {
  file: File;
  isMain: boolean;
  position: number;
}

// Vehicle management functions
export async function getVehicles() {
  try {
    // Primero obtenemos los vehículos
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (vehiclesError) {
      console.error('Error al obtener vehículos:', vehiclesError);
      toast.error('Error al cargar los vehículos');
      return { vehicles: [] };
    }
    
    // Obtener información de usuarios por separado
    const userIds = [...new Set(vehicles.map(v => v.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('Error al obtener perfiles de usuarios:', profilesError);
      // Continuamos con los vehículos sin información de usuario
    }
    
    // Crear un mapa de perfiles para búsqueda rápida
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }
    
    // Formatear vehículos
    const formattedVehicles: AdminVehicle[] = vehicles.map(vehicle => {
      const profile = profileMap.get(vehicle.user_id);
      
      return {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        user_id: vehicle.user_id,
        is_approved: vehicle.is_approved || false,
        created_at: vehicle.created_at,
        user: {
          email: profile ? (profile.email || 'Sin correo') : 'Sin correo',
          first_name: profile ? profile.first_name : undefined,
          last_name: profile ? profile.last_name : undefined
        }
      };
    });
    
    return { vehicles: formattedVehicles };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al cargar los vehículos');
    return { vehicles: [] };
  }
}

export async function approveVehicle(vehicleId: string) {
  try {
    const { error } = await supabase
      .from('vehicles')
      .update({ is_approved: true })
      .eq('id', vehicleId);
      
    if (error) {
      console.error('Error al aprobar vehículo:', error);
      toast.error('Error al aprobar el vehículo');
      return false;
    }
    
    toast.success('Vehículo aprobado correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al aprobar el vehículo');
    return false;
  }
}

// Auction interaction functions
export async function getAuctionById(auctionId: string) {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles(*)
      `)
      .eq('id', auctionId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return { auction: data, error: null };
  } catch (error) {
    console.error('Error al obtener subasta:', error);
    return { auction: null, error };
  }
}

export async function getAuctionQuestions(auctionId: string) {
  try {
    const { data, error } = await supabase
      .from('auction_questions')
      .select('*')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { questions: data, error: null };
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    return { questions: [], error };
  }
}

export async function submitQuestion(auctionId: string, question: string) {
  try {
    const { error } = await supabase
      .from('auction_questions')
      .insert({
        auction_id: auctionId,
        question,
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
    if (error) {
      toast.error('Error al enviar la pregunta');
      return { success: false };
    }
    
    toast.success('Pregunta enviada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error al enviar pregunta:', error);
    toast.error('Error al enviar la pregunta');
    return { success: false };
  }
}

export async function answerQuestion(questionId: string, answer: string) {
  try {
    const { error } = await supabase
      .from('auction_questions')
      .update({
        answer,
        is_answered: true,
        answered_at: new Date().toISOString()
      })
      .eq('id', questionId);
      
    if (error) {
      toast.error('Error al responder la pregunta');
      return { success: false };
    }
    
    toast.success('Respuesta enviada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error al responder pregunta:', error);
    toast.error('Error al responder la pregunta');
    return { success: false };
  }
}

export async function getAuctionBids(auctionId: string) {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { bids: data, error: null };
  } catch (error) {
    console.error('Error al obtener pujas:', error);
    return { bids: [], error };
  }
}

export async function placeBid(auctionId: string, amount: number) {
  try {
    const { error } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        amount,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        hold_amount: amount
      });
      
    if (error) {
      toast.error('Error al realizar la oferta');
      return { success: false };
    }
    
    toast.success('Oferta realizada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error al realizar oferta:', error);
    toast.error('Error al realizar la oferta');
    return { success: false };
  }
}

export async function finalizeAuction(auctionId: string) {
  try {
    const { error } = await supabase
      .from('auctions')
      .update({ status: 'completed' })
      .eq('id', auctionId);
      
    if (error) {
      toast.error('Error al finalizar la subasta');
      return { success: false };
    }
    
    toast.success('Subasta finalizada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error al finalizar subasta:', error);
    toast.error('Error al finalizar la subasta');
    return { success: false };
  }
}

// Favorite management
export async function isFavorite(auctionId: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { isFavorite: false };
    }
    
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('auction_id', auctionId)
      .eq('user_id', user.user.id);
      
    if (error) {
      throw error;
    }
    
    return { isFavorite: data.length > 0 };
  } catch (error) {
    console.error('Error al verificar favorito:', error);
    return { isFavorite: false };
  }
}

export async function addToFavorites(auctionId: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return;
    }
    
    const { error } = await supabase
      .from('favorites')
      .insert({
        auction_id: auctionId,
        user_id: user.user.id
      });
      
    if (error) {
      toast.error('Error al guardar en favoritos');
      throw error;
    }
    
    toast.success('Agregado a favoritos');
  } catch (error) {
    console.error('Error al agregar a favoritos:', error);
  }
}

export async function removeFromFavorites(auctionId: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return;
    }
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('auction_id', auctionId)
      .eq('user_id', user.user.id);
      
    if (error) {
      toast.error('Error al eliminar de favoritos');
      throw error;
    }
    
    toast.success('Eliminado de favoritos');
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
  }
}

// User-specific functions
export async function getUserVehicles() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { vehicles: [] };
    }
    
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        auctions(*)
      `)
      .eq('user_id', user.user.id);
      
    if (error) {
      throw error;
    }
    
    return { vehicles: data };
  } catch (error) {
    console.error('Error al obtener vehículos del usuario:', error);
    return { vehicles: [] };
  }
}

export async function getUserFavorites() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { favorites: [] };
    }
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        auctions(
          *,
          vehicles(*)
        )
      `)
      .eq('user_id', user.user.id);
      
    if (error) {
      throw error;
    }
    
    return { favorites: data };
  } catch (error) {
    console.error('Error al obtener favoritos del usuario:', error);
    return { favorites: [] };
  }
}

// Vehicle selling process
export async function saveVehicleBasicInfo(vehicleInfo: VehicleBasicInfo) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { vehicle: null, error: new Error('Usuario no autenticado') };
    }
    
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        brand: vehicleInfo.brand,
        model: vehicleInfo.model,
        year: parseInt(vehicleInfo.year),
        kilometers: parseInt(vehicleInfo.kilometers),
        fuel: vehicleInfo.fuel,
        transmission: vehicleInfo.transmission,
        description: vehicleInfo.description,
        user_id: user.user.id
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return { vehicle: data, error: null };
  } catch (error) {
    console.error('Error al guardar información del vehículo:', error);
    return { vehicle: null, error };
  }
}

export async function updateVehicleBasicInfo(vehicleId: string, vehicleInfo: VehicleBasicInfo) {
  try {
    const { error } = await supabase
      .from('vehicles')
      .update({
        brand: vehicleInfo.brand,
        model: vehicleInfo.model,
        year: parseInt(vehicleInfo.year),
        kilometers: parseInt(vehicleInfo.kilometers),
        fuel: vehicleInfo.fuel,
        transmission: vehicleInfo.transmission,
        description: vehicleInfo.description
      })
      .eq('id', vehicleId);
      
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar información del vehículo:', error);
    return { success: false };
  }
}

export async function uploadVehiclePhoto(vehicleId: string, photoParams: PhotoUploadParams) {
  try {
    const filename = `${Date.now()}-${photoParams.file.name}`;
    const filePath = `vehicles/${vehicleId}/${filename}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('vehicle-photos')
      .upload(filePath, photoParams.file);
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-photos')
      .getPublicUrl(filePath);
    
    // Save photo reference to database
    const { error: dbError } = await supabase
      .from('vehicle_photos')
      .insert({
        vehicle_id: vehicleId,
        url: publicUrl,
        is_primary: photoParams.isMain,
        position: photoParams.position
      });
      
    if (dbError) {
      throw dbError;
    }
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error al subir foto:', error);
    return { success: false };
  }
}

export async function saveVehicleFeatures(vehicleId: string, features: VehicleFeature[]) {
  try {
    if (features.length === 0) {
      return { success: true };
    }
    
    // Insert features
    const featuresToInsert = features.map(f => ({
      vehicle_id: vehicleId,
      category: f.category,
      feature: f.feature
    }));
    
    const { error } = await supabase
      .from('vehicle_features')
      .insert(featuresToInsert);
      
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error al guardar características:', error);
    return { success: false };
  }
}

export async function saveAuctionInfo(vehicleId: string, auctionInfo: AuctionInfo) {
  try {
    // Create auction
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .insert({
        vehicle_id: vehicleId,
        start_price: auctionInfo.startPrice,
        reserve_price: auctionInfo.reservePrice,
        duration_days: auctionInfo.durationDays,
        min_increment: auctionInfo.minIncrement
      })
      .select()
      .single();
      
    if (auctionError) {
      throw auctionError;
    }
    
    // Add services if selected
    if (auctionInfo.services.length > 0) {
      const servicesToInsert = auctionInfo.services.map(service => ({
        auction_id: auction.id,
        service_type: service,
        price: service === 'verification' ? 80000 : 
               service === 'photography' ? 50000 : 
               service === 'highlight' ? 30000 : 0
      }));
      
      const { error: servicesError } = await supabase
        .from('auction_services')
        .insert(servicesToInsert);
        
      if (servicesError) {
        console.error('Error al guardar servicios:', servicesError);
      }
    }
    
    return { auction, error: null };
  } catch (error) {
    console.error('Error al guardar información de subasta:', error);
    return { auction: null, error };
  }
}

export async function activateAuction(auctionId: string) {
  try {
    const startDate = new Date();
    const endDate = new Date();
    
    // Obtener los días de duración
    const { data: auction, error: fetchError } = await supabase
      .from('auctions')
      .select('duration_days')
      .eq('id', auctionId)
      .single();
      
    if (fetchError) {
      throw fetchError;
    }
    
    // Calcular fecha de finalización
    endDate.setDate(endDate.getDate() + auction.duration_days);
    
    // Actualizar la subasta
    const { error } = await supabase
      .from('auctions')
      .update({
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .eq('id', auctionId);
      
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error al activar subasta:', error);
    return { success: false };
  }
}

// Identity verification
export async function updateRutInfo(rut: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ rut })
      .eq('id', user.user.id);
      
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error al guardar RUT:', error);
    return { success: false };
  }
}

export async function uploadIdentityDocument(file: File, isSelfie: boolean) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, url: null };
    }
    
    const filename = `${Date.now()}-${file.name}`;
    const filePath = `identity/${user.user.id}/${filename}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('identity-docs')
      .upload(filePath, file);
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('identity-docs')
      .getPublicUrl(filePath);
    
    // Save reference to user profile
    const updateData = isSelfie 
      ? { identity_selfie_url: publicUrl }
      : { identity_document_url: publicUrl };
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.user.id);
      
    if (updateError) {
      throw updateError;
    }
    
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error al subir documento:', error);
    return { success: false, url: null };
  }
}

export async function getVerificationStatus() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return {
        isVerified: false,
        hasRut: false,
        hasDocuments: false,
        hasSelfie: false
      };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('rut, identity_document_url, identity_selfie_url, identity_verified')
      .eq('id', user.user.id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return {
      isVerified: data.identity_verified || false,
      hasRut: !!data.rut,
      hasDocuments: !!data.identity_document_url,
      hasSelfie: !!data.identity_selfie_url
    };
  } catch (error) {
    console.error('Error al obtener estado de verificación:', error);
    return {
      isVerified: false,
      hasRut: false,
      hasDocuments: false,
      hasSelfie: false
    };
  }
}
