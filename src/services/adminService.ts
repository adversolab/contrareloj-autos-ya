
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminUser, AdminVehicle, AdminAuction } from "./types/adminTypes";

export async function getUsers() {
  try {
    // Obtenemos todos los perfiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      console.error('Error al obtener usuarios:', profilesError);
      toast.error('Error al cargar los usuarios');
      return { users: [] };
    }
    
    // Obtenemos los datos de autenticación para obtener los emails
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error al obtener datos de autenticación:', authError);
      // Continuamos con los perfiles sin emails
    }
    
    // Mapa de ID a email para búsqueda rápida
    const emailMap = new Map();
    if (authData && authData.users) {
      authData.users.forEach((user: any) => {
        if (user && user.id && user.email) {
          emailMap.set(user.id, user.email);
        }
      });
    }
    
    // Formatear usuarios combinando datos
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

// Implement missing admin functions for vehicles
export async function getVehicles() {
  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        profiles(id, email, first_name, last_name)
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
        email: vehicle.profiles?.email || 'Sin correo',
        first_name: vehicle.profiles?.first_name,
        last_name: vehicle.profiles?.last_name
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

// Implement missing admin functions for auctions
export async function getAuctions() {
  try {
    const { data: auctions, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles(*, user_id, profiles:profiles(id, email, first_name, last_name))
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener subastas:', error);
      toast.error('Error al cargar las subastas');
      return { auctions: [] };
    }
    
    const formattedAuctions: AdminAuction[] = auctions.map(auction => ({
      id: auction.id,
      start_price: auction.start_price,
      reserve_price: auction.reserve_price,
      status: auction.status,
      vehicle_id: auction.vehicle_id,
      is_approved: auction.is_approved || false,
      created_at: auction.created_at,
      vehicle: {
        brand: auction.vehicles?.brand || 'Desconocida',
        model: auction.vehicles?.model || 'Desconocido',
        year: auction.vehicles?.year || 0
      },
      user: {
        email: auction.vehicles?.profiles?.email || 'Sin correo',
        first_name: auction.vehicles?.profiles?.first_name,
        last_name: auction.vehicles?.profiles?.last_name
      }
    }));
    
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
      .from('auction_bids')
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
