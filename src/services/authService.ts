
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      toast.error(error.message);
      return { user: null, error };
    }
    
    toast.success("Registro exitoso");
    return { user: data.user, error: null };
  } catch (error: any) {
    toast.error(error.message || "Error al registrarse");
    return { user: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast.error(error.message);
      return { user: null, error };
    }
    
    toast.success("Inicio de sesión exitoso");
    return { user: data.user, error: null };
  } catch (error: any) {
    toast.error(error.message || "Error al iniciar sesión");
    return { user: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    toast.success("Cierre de sesión exitoso");
    return { error: null };
  } catch (error: any) {
    toast.error(error.message || "Error al cerrar sesión");
    return { error };
  }
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
