
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      let errorMessage = error.message;
      
      // Personalizar mensajes de error comunes
      if (error.message.includes("already registered")) {
        errorMessage = "Este correo electrónico ya está registrado. Por favor inicia sesión.";
      }
      
      console.error("Error de registro:", error);
      return { user: null, error: { ...error, message: errorMessage } };
    }
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Error inesperado en signUp:", error);
    return { user: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      let errorMessage = error.message;
      
      // Personalizar mensajes de error comunes
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Credenciales inválidas. Por favor verifica tu correo y contraseña.";
      }
      
      console.error("Error de inicio de sesión:", error);
      return { user: null, error: { ...error, message: errorMessage } };
    }
    
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Error inesperado en signIn:", error);
    return { user: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error(error.message || "Error al cerrar sesión");
      return { error };
    }
    
    return { error: null };
  } catch (error: any) {
    console.error("Error inesperado en signOut:", error);
    toast.error(error.message || "Error al cerrar sesión");
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return null;
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) {
      console.error("Error al solicitar restablecimiento de contraseña:", error);
      return { error };
    }
    
    return { error: null };
  } catch (error: any) {
    console.error("Error inesperado en resetPassword:", error);
    return { error };
  }
}

export function setupAuthListener(callback: (user: any) => void) {
  // Usar onAuthStateChange para mantener el estado de autenticación actualizado
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });

  return data.subscription;
}
