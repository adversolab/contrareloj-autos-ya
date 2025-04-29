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

export async function getUsers() {
  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      console.error('Error al obtener usuarios:', profilesError);
      toast.error('Error al cargar los usuarios');
      return { users: [] };
    }
    
    // Get auth data to obtain emails
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error al obtener datos de autenticación:', authError);
      // Continue with profiles without emails
    }
    
    // Create ID to email map for quick lookup
    const emailMap = new Map();
    if (authData && authData.users) {
      authData.users.forEach((user: any) => {
        if (user && user.id && user.email) {
          emailMap.set(user.id, user.email);
        }
      });
    }
    
    // Format users combining data
    const formattedUsers: AdminUser[] = profiles.map(profile => ({
      id: profile.id,
      email: emailMap.get(profile.id) || 'Sin correo',
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role as "user" | "admin" | "moderator",
      identity_verified: profile.identity_verified || false,
      created_at: profile.created_at
    }));
    
    return { users: formattedUsers };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al cargar los usuarios');
    return { users: [] };
  }
}

export async function getUserDocuments(userId: string) {
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
    
    return {
      rut: data?.rut,
      identity_document_url: data?.identity_document_url,
      identity_selfie_url: data?.identity_selfie_url
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
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        profiles(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener vehículos:', error);
      toast.error('Error al cargar los vehículos');
      return { vehicles: [] };
    }
    
    const formattedVehicles: AdminVehicle[] = vehicles.map(vehicle => ({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      user_id: vehicle.user_id,
      is_approved: vehicle.is_approved || false,
      created_at: vehicle.created_at,
      user: {
        // Use optional chaining and provide default values
        email: vehicle.profiles?.email || 'Sin correo',
        first_name: vehicle.profiles?.first_name || null,
        last_name: vehicle.profiles?.last_name || null
      }
    }));
    
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
    const { data: auctions, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles(*, 
          profiles:profiles(id, first_name, last_name, email)
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener subastas:', error);
      toast.error('Error al cargar las subastas');
      return { auctions: [] };
    }
    
    const formattedAuctions: AdminAuction[] = auctions.map(auction => {
      const vehicle = auction.vehicles || {};
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
          brand: vehicle?.brand || 'Desconocida',
          model: vehicle?.model || 'Desconocido',
          year: vehicle?.year || 0
        },
        user: {
          email: profile?.email || 'Sin correo',
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null
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
      .from('bids') // Use 'bids' instead of 'auction_bids'
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

// Export all required types
export type { AdminUser, AdminVehicle, AdminAuction };
