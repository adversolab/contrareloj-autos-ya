
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
export async function createNotification(userId: string, title: string, message: string, type: string = 'admin', relatedId?: string) {
  try {
    console.log('createNotification: Starting to create notification...');
    
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('createNotification: No authenticated user found');
      return false;
    }

    const adminId = currentUser.id;
    console.log('createNotification: Current admin ID:', adminId);
    console.log('createNotification: Target user ID:', userId);
    console.log('createNotification: Message details:', { title, message, type });

    // Prepare notification data with explicit sent_by field
    const notificationData = {
      user_id: userId,
      title: title,
      message: message,
      type: type,
      related_id: relatedId || null,
      is_read: false,
      sent_by: adminId // Explicitly set the admin ID who sent the message
    };

    console.log('createNotification: Inserting notification data:', notificationData);

    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select('*'); // Select to get the inserted data back

    if (error) {
      console.error('createNotification: Supabase error:', error);
      console.error('createNotification: Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log('createNotification: Successfully inserted notification:', data);
    console.log('createNotification: Notification created with sent_by =', adminId);
    return true;
  } catch (error) {
    console.error('createNotification: Unexpected error:', error);
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
