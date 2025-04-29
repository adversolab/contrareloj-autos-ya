
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AdminUser } from "./types/adminTypes";

export async function getUsers() {
  try {
    // Obtenemos todos los perfiles con emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, identity_verified, created_at, email')
      .order('created_at', { ascending: false });
      
    if (profilesError) {
      console.error('Error al obtener usuarios:', profilesError);
      toast.error('Error al cargar los usuarios');
      return { users: [] };
    }
    
    // Formatear usuarios
    const formattedUsers: AdminUser[] = profiles.map(profile => ({
      id: profile.id,
      email: profile.email || 'Sin correo',
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
