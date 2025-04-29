
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

// Tipos
export interface AdminUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "user" | "admin" | "moderator"; // Especificamos los valores permitidos
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
    first_name?: string;
    last_name?: string;
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
    first_name?: string;
    last_name?: string;
  };
}

// Funciones para gestión de usuarios
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

// Funciones para gestión de vehículos
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

// Funciones para gestión de subastas
export async function getAuctions() {
  try {
    // Primero obtenemos las subastas
    const { data: auctions, error: auctionsError } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles(*)
      `)
      .order('created_at', { ascending: false });
      
    if (auctionsError) {
      console.error('Error al obtener subastas:', auctionsError);
      toast.error('Error al cargar las subastas');
      return { auctions: [] };
    }
    
    // Obtener los IDs de usuarios desde los vehículos
    const userIds = auctions
      .map(auction => auction.vehicles?.user_id)
      .filter(Boolean);
      
    // Obtener información de usuarios por separado
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('Error al obtener perfiles de usuarios:', profilesError);
      // Continuamos con las subastas sin información de usuario
    }
    
    // Crear un mapa de perfiles para búsqueda rápida
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }
    
    // Formatear subastas
    const formattedAuctions: AdminAuction[] = auctions.map(auction => {
      const vehicle = auction.vehicles;
      const profile = vehicle ? profileMap.get(vehicle.user_id) : null;
      
      return {
        id: auction.id,
        start_price: auction.start_price,
        reserve_price: auction.reserve_price,
        status: auction.status,
        vehicle_id: auction.vehicle_id,
        is_approved: auction.is_approved || false,
        created_at: auction.created_at,
        vehicle: {
          brand: vehicle ? vehicle.brand || 'Desconocida' : 'Desconocida',
          model: vehicle ? vehicle.model || 'Desconocido' : 'Desconocido',
          year: vehicle ? vehicle.year || 0 : 0
        },
        user: {
          email: profile ? (profile.email || 'Sin correo') : 'Sin correo',
          first_name: profile ? profile.first_name : undefined,
          last_name: profile ? profile.last_name : undefined
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
