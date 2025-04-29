
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminUser } from "./types/adminTypes";

export async function getUsers() {
  try {
    console.log('Fetching all users from profiles table...');
    
    // Obtenemos todos los perfiles sin filtros
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      console.error('Error al obtener usuarios:', profilesError);
      toast.error('Error al cargar los usuarios');
      return { users: [] };
    }
    
    console.log('Raw profiles data from database:', profiles);
    
    // Formatear usuarios asegurándose de que todos sean incluidos
    const formattedUsers: AdminUser[] = profiles.map(profile => ({
      id: profile.id,
      email: profile.email || 'Sin correo',
      first_name: profile.first_name || null,
      last_name: profile.last_name || null,
      role: profile.role as "user" | "admin" | "moderator",
      identity_verified: profile.identity_verified || false,
      has_identity_document: Boolean(profile.identity_document_url),
      has_selfie: Boolean(profile.identity_selfie_url),
      has_rut: Boolean(profile.rut),
      created_at: profile.created_at || new Date().toISOString()
    }));
    
    console.log('Formatted users (should include all):', formattedUsers);
    
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
