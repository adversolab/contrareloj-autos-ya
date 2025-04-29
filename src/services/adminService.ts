
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Admin type definitions
export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "user" | "admin" | "moderator";
  identity_verified: boolean;
  created_at: string;
  // Nuevos campos para detectar usuarios pendientes
  has_identity_document: boolean;
  has_selfie: boolean;
  has_rut: boolean;
}

export interface AdminVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  user_id: string;
  is_approved: boolean;
  created_at: string;
  user: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  };
}

export interface AdminAuction {
  id: string;
  start_price: number;
  reserve_price: number;
  status: string;
  vehicle_id: string;
  is_approved: boolean;
  created_at: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
  };
  user: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  };
}

export interface UserDocuments {
  rut?: string;
  identity_document_url?: string;
  identity_selfie_url?: string;
  front_url?: string;
  back_url?: string;
}

// Define interfaces for database responses
interface ProfileWithEmail {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: "user" | "admin" | "moderator";
  identity_verified: boolean | null;
  created_at: string | null;
  rut?: string | null;
  identity_document_url?: string | null;
  identity_selfie_url?: string | null;
}

interface VehicleWithProfile {
  id: string;
  brand: string;
  model: string;
  year: number;
  user_id: string;
  is_approved: boolean | null;
  created_at: string;
  profiles: {
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
}

interface AuctionWithDetails {
  id: string;
  start_price: number;
  reserve_price: number;
  status: string;
  vehicle_id: string;
  is_approved: boolean | null;
  created_at: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
    user_id: string;
    profiles: {
      email?: string | null;
      first_name?: string | null;
      last_name?: string | null;
    } | null;
  } | null;
}

export async function getUsers() {
  try {
    console.log("Fetching users from profiles table...");
    
    // Modified query to include all verification documents
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, identity_verified, created_at, rut, identity_document_url, identity_selfie_url')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      console.error('Error al obtener usuarios:', profilesError);
      toast.error('Error al cargar los usuarios');
      return { users: [] };
    }
    
    console.log("Raw profiles data:", profiles);
    
    // Format users with email data and verification status
    const formattedUsers: AdminUser[] = (profiles || []).map(profile => {
      // Check if any verification fields exist
      const hasDocument = !!profile.identity_document_url;
      const hasSelfie = !!profile.identity_selfie_url;
      const hasRut = !!profile.rut;
      
      console.log(`User ${profile.email}: doc=${hasDocument}, selfie=${hasSelfie}, rut=${hasRut}, verified=${profile.identity_verified}`);
      
      return {
        id: profile.id,
        email: profile.email || 'Sin correo',
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role as "user" | "admin" | "moderator",
        identity_verified: profile.identity_verified || false,
        created_at: profile.created_at || '',
        // New fields to identify pending verification users
        has_identity_document: hasDocument,
        has_selfie: hasSelfie,
        has_rut: hasRut
      };
    });
    
    console.log("Formatted users:", formattedUsers);
    console.log("Pending verification users:", formattedUsers.filter(user => !user.identity_verified && (user.has_identity_document || user.has_selfie || user.has_rut)));
    
    return { users: formattedUsers };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al cargar los usuarios');
    return { users: [] };
  }
}

export async function getUserDocuments(userId: string): Promise<UserDocuments | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('rut, identity_document_url, identity_selfie_url')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error al obtener documentos:', error);
      toast.error('Error al cargar los documentos');
      return null;
    }
    
    // Parse the JSON string in identity_document_url if it exists
    let frontUrl: string | undefined = undefined;
    let backUrl: string | undefined = undefined;
    
    if (data?.identity_document_url) {
      try {
        const documentUrls = JSON.parse(data.identity_document_url);
        frontUrl = documentUrls.front;
        backUrl = documentUrls.back;
      } catch (e) {
        console.error('Error parsing document URL JSON:', e);
        // If parsing fails, assume it's a legacy format with just a single URL
        frontUrl = data.identity_document_url;
      }
    }
    
    return {
      rut: data?.rut,
      identity_document_url: data?.identity_document_url,
      identity_selfie_url: data?.identity_selfie_url,
      front_url: frontUrl,
      back_url: backUrl
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al cargar los documentos');
    return null;
  }
}

export async function verifyUser(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ identity_verified: true })
      .eq('id', userId);
      
    if (error) {
      console.error('Error al verificar usuario:', error);
      toast.error('Error al verificar el usuario');
      return false;
    }
    
    toast.success('Usuario verificado correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al verificar el usuario');
    return false;
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin" | "moderator") {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
      
    if (error) {
      console.error('Error al actualizar rol:', error);
      toast.error('Error al actualizar el rol del usuario');
      return false;
    }
    
    toast.success('Rol actualizado correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al actualizar el rol del usuario');
    return false;
  }
}

// Admin functions for vehicles
export async function getVehicles() {
  try {
    // First, get all vehicles with user information
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select(`
        *,
        profiles:user_id (
          first_name, 
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });
      
    if (vehiclesError) {
      console.error('Error al obtener vehículos:', vehiclesError);
      toast.error('Error al cargar los vehículos');
      return { vehicles: [] };
    }
    
    console.log("Vehicles fetched:", vehicles);
    
    // Format vehicles with owner information
    const formattedVehicles: AdminVehicle[] = (vehicles as unknown as VehicleWithProfile[]).map(vehicle => {
      const profile = vehicle.profiles || {};
      
      return {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        user_id: vehicle.user_id,
        is_approved: vehicle.is_approved || false,
        created_at: vehicle.created_at,
        user: {
          email: profile.email || 'Sin correo',
          first_name: profile.first_name || null,
          last_name: profile.last_name || null
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

export async function deleteVehicle(vehicleId: string) {
  try {
    // Primero eliminar fotos asociadas
    await supabase
      .from('vehicle_photos')
      .delete()
      .eq('vehicle_id', vehicleId);
      
    // Luego eliminar características
    await supabase
      .from('vehicle_features')
      .delete()
      .eq('vehicle_id', vehicleId);
      
    // Finalmente eliminar el vehículo
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);
      
    if (error) {
      console.error('Error al eliminar vehículo:', error);
      toast.error('Error al eliminar el vehículo');
      return false;
    }
    
    toast.success('Vehículo eliminado correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al eliminar el vehículo');
    return false;
  }
}

// Admin functions for auctions
export async function getAuctions() {
  try {
    // Get all auctions with vehicle and user information in a single query
    const { data: auctions, error: auctionsError } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicle:vehicle_id (
          brand, 
          model, 
          year,
          user_id,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false });
      
    if (auctionsError) {
      console.error('Error al obtener subastas:', auctionsError);
      toast.error('Error al cargar las subastas');
      return { auctions: [] };
    }
    
    // Format auctions with vehicle and owner information
    const formattedAuctions: AdminAuction[] = (auctions as unknown as AuctionWithDetails[]).map(auction => {
      const vehicle = auction.vehicle || {} as AuctionWithDetails['vehicle'];
      const profile = vehicle.profiles || {};
      
      return {
        id: auction.id,
        start_price: auction.start_price,
        reserve_price: auction.reserve_price,
        status: auction.status,
        vehicle_id: auction.vehicle_id,
        is_approved: auction.is_approved || false,
        created_at: auction.created_at,
        vehicle: {
          brand: vehicle.brand || 'Desconocida',
          model: vehicle.model || 'Desconocido',
          year: vehicle.year || 0
        },
        user: {
          email: profile.email || 'Sin correo',
          first_name: profile.first_name || null,
          last_name: profile.last_name || null
        }
      };
    });
    
    return { auctions: formattedAuctions };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al cargar las subastas');
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
      toast.error('Error al aprobar la subasta');
      return false;
    }
    
    toast.success('Subasta aprobada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al aprobar la subasta');
    return false;
  }
}

export async function deleteAuction(auctionId: string) {
  try {
    // Primero eliminar pujas asociadas
    await supabase
      .from('bids')
      .delete()
      .eq('auction_id', auctionId);
      
    // Eliminar preguntas
    await supabase
      .from('auction_questions')
      .delete()
      .eq('auction_id', auctionId);
      
    // Finalmente eliminar la subasta
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error al eliminar subasta:', error);
      toast.error('Error al eliminar la subasta');
      return false;
    }
    
    toast.success('Subasta eliminada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al eliminar la subasta');
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
      toast.error('Error al pausar la subasta');
      return false;
    }
    
    toast.success('Subasta pausada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al pausar la subasta');
    return false;
  }
}
