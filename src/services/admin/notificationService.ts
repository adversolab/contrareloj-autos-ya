// This service is deprecated - all functionality has been moved to direct Supabase queries
// in the respective components to remove dependency on Lovable internal endpoints

export interface UserLastNotification {
  user_id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

// Keeping these exports for backward compatibility but marking as deprecated
export const getLastNotificationForUser = async (userId: string): Promise<UserLastNotification | null> => {
  console.warn('getLastNotificationForUser is deprecated - use direct Supabase queries instead');
  return null;
};

export const getUsersWithNotificationStatus = async (userIds: string[]) => {
  console.warn('getUsersWithNotificationStatus is deprecated - use direct Supabase queries instead');
  return {};
};
