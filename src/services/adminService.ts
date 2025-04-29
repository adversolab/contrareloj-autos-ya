
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Type definitions for admin features
export interface UserDocuments {
  rut?: string;
  identity_document_url?: string;
  identity_selfie_url?: string;
  front_url?: string;
  back_url?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "user" | "admin" | "moderator";
  identity_verified: boolean;
  has_identity_document: boolean;
  has_selfie: boolean;
  has_rut: boolean;
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

// User management functions
export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener usuarios:', error);
      toast({ title: "Error", description: "No se pudieron cargar los usuarios", variant: "destructive" });
      return { users: [] };
    }
    
    // Process the user data to determine document availability
    const users: AdminUser[] = data.map(user => ({
      id: user.id,
      email: user.email || '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role as "user" | "admin" | "moderator",
      identity_verified: user.identity_verified || false,
      has_identity_document: !!user.identity_document_url,
      has_selfie: !!user.identity_selfie_url,
      has_rut: !!user.rut,
      created_at: user.created_at || new Date().toISOString()
    }));
    
    return { users };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudieron cargar los usuarios", variant: "destructive" });
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
      toast({ title: "Error", description: "No se pudo verificar al usuario", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Usuario verificado correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo verificar al usuario", variant: "destructive" });
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
      toast({ title: "Error", description: "No se pudo actualizar el rol del usuario", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Rol actualizado correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo actualizar el rol del usuario", variant: "destructive" });
    return false;
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
      toast({ title: "Error", description: "Error al cargar los documentos", variant: "destructive" });
      return null;
    }
    
    console.log("Raw user documents data:", data);
    
    // Parse the JSON string in identity_document_url if it exists
    let frontUrl: string | undefined = undefined;
    let backUrl: string | undefined = undefined;
    
    if (data?.identity_document_url) {
      try {
        // Check if it's a JSON string
        if (typeof data.identity_document_url === 'string' && 
            (data.identity_document_url.startsWith('{') || data.identity_document_url.includes('front'))) {
          // Try to parse it as JSON
          const documentUrls = JSON.parse(data.identity_document_url);
          frontUrl = documentUrls.front;
          backUrl = documentUrls.back;
        } else {
          // If it doesn't look like JSON, use it as a direct URL
          frontUrl = data.identity_document_url;
        }
      } catch (e) {
        console.error('Error parsing document URL JSON:', e);
        // If parsing fails, assume it's a legacy format with just a single URL
        frontUrl = data.identity_document_url;
      }
    }
    
    console.log("Processed document URLs: front=", frontUrl, "back=", backUrl);
    
    return {
      rut: data?.rut,
      identity_document_url: data?.identity_document_url,
      identity_selfie_url: data?.identity_selfie_url,
      front_url: frontUrl,
      back_url: backUrl
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "Error al cargar los documentos", variant: "destructive" });
    return null;
  }
}

// Vehicle management functions
export async function getVehicles() {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        user:user_id (
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener vehículos:', error);
      toast({ title: "Error", description: "No se pudieron cargar los vehículos", variant: "destructive" });
      return { vehicles: [] };
    }
    
    return { vehicles: data as AdminVehicle[] };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudieron cargar los vehículos", variant: "destructive" });
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
      toast({ title: "Error", description: "No se pudo aprobar el vehículo", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Vehículo aprobado correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo aprobar el vehículo", variant: "destructive" });
    return false;
  }
}

export async function deleteVehicle(vehicleId: string) {
  try {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId);
      
    if (error) {
      console.error('Error al eliminar vehículo:', error);
      toast({ title: "Error", description: "No se pudo eliminar el vehículo", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Vehículo eliminado correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo eliminar el vehículo", variant: "destructive" });
    return false;
  }
}

// Auction management functions
export async function getAuctions() {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicle:vehicle_id (
          brand,
          model,
          year,
          user_id
        ),
        user:vehicle!inner(user_id (
          email,
          first_name,
          last_name
        ))
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error al obtener subastas:', error);
      toast({ title: "Error", description: "No se pudieron cargar las subastas", variant: "destructive" });
      return { auctions: [] };
    }
    
    // Process data to match AdminAuction interface
    const auctions = data.map(auction => ({
      ...auction,
      user: auction.user.user_id
    })) as unknown as AdminAuction[];
    
    return { auctions };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudieron cargar las subastas", variant: "destructive" });
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
      toast({ title: "Error", description: "No se pudo aprobar la subasta", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Subasta aprobada correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo aprobar la subasta", variant: "destructive" });
    return false;
  }
}

export async function deleteAuction(auctionId: string) {
  try {
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error al eliminar subasta:', error);
      toast({ title: "Error", description: "No se pudo eliminar la subasta", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Subasta eliminada correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo eliminar la subasta", variant: "destructive" });
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
      toast({ title: "Error", description: "No se pudo pausar la subasta", variant: "destructive" });
      return false;
    }
    
    toast({ title: "Éxito", description: "Subasta pausada correctamente" });
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast({ title: "Error", description: "No se pudo pausar la subasta", variant: "destructive" });
    return false;
  }
}
