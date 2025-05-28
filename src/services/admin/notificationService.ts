
import { supabase } from '@/integrations/supabase/client';

export interface UserLastNotification {
  user_id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export const getLastNotificationForUser = async (userId: string): Promise<UserLastNotification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('user_id, title, message, created_at, is_read')
      .eq('user_id', userId)
      .eq('type', 'admin') // Only admin notifications
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching last notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

export const getUsersWithNotificationStatus = async (userIds: string[]) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('user_id, title, message, created_at, is_read')
      .in('user_id', userIds)
      .eq('type', 'admin') // Only admin notifications
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return {};
    }

    // Group by user_id and get the latest notification for each user
    const latestNotifications: Record<string, UserLastNotification> = {};
    
    data?.forEach(notification => {
      if (!latestNotifications[notification.user_id]) {
        latestNotifications[notification.user_id] = notification;
      }
    });

    return latestNotifications;
  } catch (error) {
    console.error('Unexpected error:', error);
    return {};
  }
};
