
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/authService";

// Types definitions
export interface VehicleBasicInfo {
  id?: string;
  brand: string;
  model: string;
  year: string;
  kilometers: string;
  fuel: string;
  transmission: string;
  description: string;
}

export interface VehicleFeature {
  id?: string;
  vehicle_id?: string;
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

// Extended vehicle interface to handle photo_url property
export interface VehicleWithPhoto {
  id: string;
  brand: string;
  model: string;
  year: number;
  kilometers: number;
  fuel: string;
  transmission: string;
  description: string;
  user_id: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  photo_url?: string;
  auctions: any[];
}

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

export async function uploadVehiclePhoto(
  vehicleId: string, 
  { file, isMain = false, position = 0 }: { file: File; isMain?: boolean; position: number }
): Promise<{ success: boolean; url?: string }> {
  try {
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${vehicleId}_${timestamp}_${position}.${fileExt}`;
    const filePath = `vehicles/${vehicleId}/${fileName}`;

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('vehicle_photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error al subir foto:', uploadError);
      toast.error('Error al subir la foto');
      return { success: false };
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('vehicle_photos')
      .getPublicUrl(filePath);

    const url = publicUrlData?.publicUrl || '';

    // Save the photo info in the database
    const { error: dbError } = await supabase
      .from('vehicle_photos')
      .insert({
        vehicle_id: vehicleId,
        url,
        position,
        is_primary: isMain
      });

    if (dbError) {
      console.error('Error al guardar foto en BD:', dbError);
      toast.error('Error al registrar la foto');
      return { success: false, url };
    }

    return { success: true, url };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la foto');
    return { success: false };
  }
}

export async function saveAuctionInfo(vehicleId: string, info: AuctionInfo): Promise<{ success: boolean; auctionId?: string }> {
  try {
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + info.durationDays);

    // Insert auction record
    const { data, error } = await supabase
      .from('auctions')
      .insert({
        vehicle_id: vehicleId,
        start_price: info.startPrice,
        reserve_price: info.reservePrice,
        min_increment: info.minIncrement,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'draft',
        duration_days: info.durationDays
      })
      .select()
      .single();

    if (error) {
      console.error('Error al guardar información de subasta:', error);
      toast.error('Error al guardar la información de la subasta');
      return { success: false };
    }

    // Handle services separately if needed in a separate table
    if (info.services && info.services.length > 0) {
      // Add price to each service (default value of 0)
      const servicesToInsert = info.services.map(service => ({
        auction_id: data.id,
        service_type: service,
        price: 0 // Add default price value
      }));

      const { error: servicesError } = await supabase
        .from('auction_services')
        .insert(servicesToInsert);
        
      if (servicesError) {
        console.error('Error al guardar servicios:', servicesError);
        // Continue without failing the whole process
      }
    }

    return { success: true, auctionId: data.id };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la información de la subasta');
    return { success: false };
  }
}

export async function activateAuction(auctionId: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('auctions')
      .update({ status: 'active' })
      .eq('id', auctionId);

    if (error) {
      console.error('Error al activar subasta:', error);
      toast.error('Error al activar la subasta');
      return { success: false };
    }

    toast.success('¡Tu subasta ha sido enviada a revisión!');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al activar la subasta');
    return { success: false };
  }
}

// Auction viewing and participation functions
export async function getAuctionById(id: string) {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener subasta:', error);
      return { auction: null, error };
    }

    return { auction: data, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { auction: null, error };
  }
}

export async function getAuctionQuestions(auctionId: string) {
  try {
    // First, get questions without profiles join
    const { data: questionsData, error } = await supabase
      .from('auction_questions')
      .select('*')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener preguntas:', error);
      return { questions: null, error };
    }

    // Then get user profiles for each question
    const questionsWithProfiles = await Promise.all(
      questionsData.map(async (question) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', question.user_id)
          .single();

        return {
          ...question,
          profiles: profileData || { first_name: null, last_name: null }
        };
      })
    );

    return { questions: questionsWithProfiles, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { questions: null, error };
  }
}

export async function getAuctionBids(auctionId: string) {
  try {
    // First, get bids without profiles join
    const { data: bidsData, error } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false });

    if (error) {
      console.error('Error al obtener pujas:', error);
      return { bids: null, error };
    }

    // Then get user profiles for each bid
    const bidsWithProfiles = await Promise.all(
      bidsData.map(async (bid) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', bid.user_id)
          .single();

        return {
          ...bid,
          profiles: profileData || { first_name: null, last_name: null }
        };
      })
    );

    return { bids: bidsWithProfiles, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { bids: null, error };
  }
}

export async function submitQuestion(auctionId: string, questionText: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para hacer preguntas');
      return { success: false };
    }

    const { error } = await supabase
      .from('auction_questions')
      .insert({
        auction_id: auctionId,
        user_id: user.id,
        question: questionText
      });

    if (error) {
      console.error('Error al enviar pregunta:', error);
      toast.error('Error al enviar la pregunta');
      return { success: false };
    }

    toast.success('Tu pregunta ha sido enviada');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la pregunta');
    return { success: false };
  }
}

export async function answerQuestion(questionId: string, answerText: string) {
  try {
    const { error } = await supabase
      .from('auction_questions')
      .update({
        answer: answerText,
        answered_at: new Date().toISOString()
      })
      .eq('id', questionId);

    if (error) {
      console.error('Error al responder pregunta:', error);
      toast.error('Error al enviar la respuesta');
      return { success: false };
    }

    toast.success('Respuesta enviada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la respuesta');
    return { success: false };
  }
}

export async function placeBid(auctionId: string, { amount, holdAmount }: { amount: number, holdAmount: number }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para participar');
      return { success: false, needsVerification: false };
    }

    // Check if user is verified
    const { isVerified } = await getVerificationStatus();
    if (!isVerified) {
      toast.error('Debes verificar tu identidad para ofertar');
      return { success: false, needsVerification: true };
    }

    // Place the bid
    const { error } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        user_id: user.id,
        amount,
        hold_amount: holdAmount
      });

    if (error) {
      console.error('Error al realizar oferta:', error);
      toast.error('Error al procesar tu oferta');
      return { success: false, needsVerification: false };
    }

    toast.success('¡Oferta realizada con éxito!');
    return { success: true, needsVerification: false };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la oferta');
    return { success: false, needsVerification: false };
  }
}

export async function finalizeAuction(auctionId: string) {
  try {
    // Get the highest bid
    const { data: bids } = await supabase
      .from('bids')
      .select('id, user_id, amount')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1);

    const winnerId = bids && bids.length > 0 ? bids[0].user_id : null;

    // Update auction status
    const { error } = await supabase
      .from('auctions')
      .update({
        status: 'finished',
        winner_id: winnerId,
        winning_bid: winnerId ? bids[0].amount : null
      })
      .eq('id', auctionId);

    if (error) {
      console.error('Error al finalizar subasta:', error);
      toast.error('Error al finalizar la subasta');
      return { success: false, winnerId: null };
    }

    return { success: true, winnerId };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al finalizar la subasta');
    return { success: false, winnerId: null };
  }
}

// Favorite handling functions
export async function addToFavorites(auctionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return { success: false };
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        auction_id: auctionId
      });

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        // Already favorited
        return { success: true };
      }

      console.error('Error al guardar favorito:', error);
      toast.error('Error al guardar en favoritos');
      return { success: false };
    }

    toast.success('Guardado en favoritos');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al guardar en favoritos');
    return { success: false };
  }
}

export async function removeFromFavorites(auctionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({
        user_id: user.id,
        auction_id: auctionId
      });

    if (error) {
      console.error('Error al eliminar favorito:', error);
      toast.error('Error al eliminar de favoritos');
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al eliminar de favoritos');
    return { success: false };
  }
}

export async function isFavorite(auctionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { isFavorite: false };
    }

    const { data, error } = await supabase
      .from('favorites')
      .select()
      .match({
        user_id: user.id,
        auction_id: auctionId
      });

    if (error) {
      console.error('Error al verificar favorito:', error);
      return { isFavorite: false };
    }

    return { isFavorite: data.length > 0 };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { isFavorite: false };
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

    // Format favorites data
    const formattedFavorites = data.map(fav => ({
      id: fav.auctions?.id,
      title: `${fav.auctions?.vehicles?.brand} ${fav.auctions?.vehicles?.model} ${fav.auctions?.vehicles?.year}`,
      description: fav.auctions?.vehicles?.description,
      currentBid: fav.auctions?.start_price,
      endTime: fav.auctions?.end_date ? new Date(fav.auctions.end_date) : new Date(),
    }));

    return { favorites: formattedFavorites, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { favorites: [], error: 'Error al cargar favoritos' };
  }
}

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

// Update the RUT info and store it in the profile
export async function updateRutInfo(rut: string): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para actualizar tu información');
      return { success: false };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ rut })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error al actualizar RUT:', error);
      toast.error('Error al guardar tu RUT');
      return { success: false };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la solicitud');
    return { success: false };
  }
}

// Upload and manage identity documents
export async function uploadIdentityDocument(file: File, isSelfie: boolean = false): Promise<{ url: string; success: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para subir documentos');
      return { url: '', success: false };
    }
    
    // Create a unique filename using a timestamp and the user ID
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${isSelfie ? 'selfie' : 'document'}_${timestamp}.${fileExt}`;
    
    // Use the right path based on whether it's a selfie or a document
    const filePath = isSelfie 
      ? `identity_verification/${user.id}/selfie`
      : `identity_verification/${user.id}/document`;
    
    // Upload the file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('identity_docs')
      .upload(`${filePath}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error al subir el documento:', uploadError);
      toast.error('Error al subir el documento. Por favor intenta de nuevo.');
      return { url: '', success: false };
    }
    
    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('identity_docs')
      .getPublicUrl(`${filePath}/${fileName}`);
    
    const url = publicUrlData?.publicUrl || '';
    
    // Update the user profile with the document URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update(isSelfie 
        ? { identity_selfie_url: url } 
        : { identity_document_url: url }
      )
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error al actualizar el perfil:', updateError);
      toast.error('Error al guardar la información. Por favor intenta de nuevo.');
      return { url, success: false };
    }
    
    return { url, success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la solicitud');
    return { url: '', success: false };
  }
}

// Get the current verification status
export async function getVerificationStatus(): Promise<{
  isVerified: boolean;
  hasRut: boolean;
  hasDocuments: boolean;
  hasSelfie: boolean;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
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
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error al obtener estado de verificación:', error);
      return {
        isVerified: false,
        hasRut: false,
        hasDocuments: false,
        hasSelfie: false
      };
    }
    
    return {
      isVerified: data?.identity_verified || false,
      hasRut: !!data?.rut,
      hasDocuments: !!data?.identity_document_url,
      hasSelfie: !!data?.identity_selfie_url
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return {
      isVerified: false,
      hasRut: false,
      hasDocuments: false,
      hasSelfie: false
    };
  }
}

// Export all types and functions to avoid import errors
export { toast } from "sonner";
