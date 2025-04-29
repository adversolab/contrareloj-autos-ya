
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
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*, auth_users:id(email)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener usuarios:', error);
      toast.error('Error al cargar los usuarios');
      return { users: [] };
    }
    
    // Formatear usuarios
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: (user.auth_users as { email: string } | null)?.email || 'Sin correo',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      identity_verified: user.identity_verified || false,
      created_at: user.created_at
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
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        profiles!vehicles_user_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener vehículos:', error);
      toast.error('Error al cargar los vehículos');
      return { vehicles: [] };
    }
    
    // Formatear vehículos
    const formattedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      user_id: vehicle.user_id,
      is_approved: vehicle.is_approved || false,
      created_at: vehicle.created_at,
      user: {
        email: vehicle.profiles ? (vehicle.profiles as any).email || 'Sin correo' : 'Sin correo',
        first_name: vehicle.profiles ? (vehicle.profiles as any).first_name : undefined,
        last_name: vehicle.profiles ? (vehicle.profiles as any).last_name : undefined
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

// Funciones para gestión de subastas
export async function getAuctions() {
  try {
    const { data: auctions, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles!auctions_vehicle_id_fkey (
          id,
          brand,
          model,
          year,
          user_id,
          profiles!vehicles_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener subastas:', error);
      toast.error('Error al cargar las subastas');
      return { auctions: [] };
    }
    
    // Formatear subastas
    const formattedAuctions = auctions.map(auction => ({
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
        email: auction.vehicles?.profiles ? (auction.vehicles.profiles as any).email || 'Sin correo' : 'Sin correo',
        first_name: auction.vehicles?.profiles ? (auction.vehicles.profiles as any).first_name : undefined,
        last_name: auction.vehicles?.profiles ? (auction.vehicles.profiles as any).last_name : undefined
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
