
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
    // First, get all vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (vehiclesError) {
      console.error('Error al obtener vehículos:', vehiclesError);
      toast.error('Error al cargar los vehículos');
      return { vehicles: [] };
    }
    
    // For each vehicle, get the owner information
    const formattedVehicles: AdminVehicle[] = await Promise.all(
      vehicles.map(async (vehicle) => {
        // Get user profile for this vehicle
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', vehicle.user_id)
          .single();
        
        // Get user email (could be enhanced with batching)
        const { data: userData } = await supabase.auth.admin.getUserById(vehicle.user_id);
        
        return {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          user_id: vehicle.user_id,
          is_approved: vehicle.is_approved || false,
          created_at: vehicle.created_at,
          user: {
            email: userData?.user?.email || 'Sin correo',
            first_name: profileData?.first_name || null,
            last_name: profileData?.last_name || null
          }
        };
      })
    );
    
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
    // First, get all auctions
    const { data: auctions, error: auctionsError } = await supabase
      .from('auctions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (auctionsError) {
      console.error('Error al obtener subastas:', auctionsError);
      toast.error('Error al cargar las subastas');
      return { auctions: [] };
    }
    
    // For each auction, get the vehicle and owner details
    const formattedAuctions: AdminAuction[] = await Promise.all(
      auctions.map(async (auction) => {
        // Get vehicle data
        const { data: vehicleData } = await supabase
          .from('vehicles')
          .select('brand, model, year, user_id')
          .eq('id', auction.vehicle_id)
          .single();

        let userEmail = 'Sin correo';
        let firstName = null;
        let lastName = null;
        
        if (vehicleData && vehicleData.user_id) {
          // Get profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', vehicleData.user_id)
            .single();
            
          // Get user email
          const { data: userData } = await supabase.auth.admin.getUserById(vehicleData.user_id);
          
          if (userData && userData.user) {
            userEmail = userData.user.email || 'Sin correo';
          }
          
          if (profileData) {
            firstName = profileData.first_name;
            lastName = profileData.last_name;
          }
        }
        
        return {
          id: auction.id,
          start_price: auction.start_price,
          reserve_price: auction.reserve_price,
          status: auction.status,
          vehicle_id: auction.vehicle_id,
          is_approved: auction.is_approved || false,
          created_at: auction.created_at,
          vehicle: {
            brand: vehicleData?.brand || 'Desconocida',
            model: vehicleData?.model || 'Desconocido',
            year: vehicleData?.year || 0
          },
          user: {
            email: userEmail,
            first_name: firstName,
            last_name: lastName
          }
        };
      })
    );
    
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
