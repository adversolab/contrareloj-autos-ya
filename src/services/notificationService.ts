
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/authService";

// Get all notifications for the current user
export async function getUserNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { notifications: [] };
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error getting notifications:', error);
      return { notifications: [] };
    }

    return { notifications: data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { notifications: [] };
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false };
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false };
  }
}

// Create a notification for a specific user (for admin use)
export async function createNotification(userId: string, title: string, message: string, type: string = 'info', relatedId?: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting notification:', error);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false };
  }
}

// Get unread notifications count
export async function getUnreadNotificationsCount() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { count: 0 };
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error counting unread notifications:', error);
      return { count: 0 };
    }

    return { count: count || 0 };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { count: 0 };
  }
}

// Utility function for automatic notifications (imported from autoNotificationService)
export { enviarNotificacion, autoNotifications } from './autoNotificationService';
