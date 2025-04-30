
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "./authService";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export async function getUserNotifications(): Promise<{ notifications: Notification[], error: string | null }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { notifications: [], error: "Usuario no autenticado" };
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error al obtener notificaciones:", error);
      return { notifications: [], error: error.message };
    }
    
    return { notifications: data as Notification[], error: null };
  } catch (error) {
    console.error("Error inesperado:", error);
    return { notifications: [], error: "Error al cargar las notificaciones" };
  }
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        related_id: relatedId,
        is_read: false
      });
      
    if (error) {
      console.error("Error al crear notificación:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error inesperado:", error);
    return false;
  }
}

export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (error) {
      console.error("Error al marcar como leído:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error inesperado:", error);
    return false;
  }
}

export async function markAllAsRead(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
      
    if (error) {
      console.error("Error al marcar todas como leídas:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error inesperado:", error);
    return false;
  }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
      
    if (error) {
      console.error("Error al eliminar notificación:", error);
      return false;
    }
    
    toast.success("Notificación eliminada");
    return true;
  } catch (error) {
    console.error("Error inesperado:", error);
    return false;
  }
}
