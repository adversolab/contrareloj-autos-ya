
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';
import { useIsMobile } from '@/hooks/use-mobile';

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: string;
  related_id?: string;
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      const { notifications: userNotifications } = await getUserNotifications();
      setNotifications(userNotifications || []);
      setUnreadCount(userNotifications?.filter(n => !n.is_read).length || 0);
    };
    
    fetchNotifications();
    
    // Set up polling for new notifications
    const intervalId = setInterval(fetchNotifications, 30000); // Every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [user]);

  const handleNotificationClick = async (notificationId: string) => {
    // Mark as read
    await markNotificationAsRead(notificationId);
    
    // Update local state
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, is_read: true }))
    );
    setUnreadCount(0);
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[350px] p-0" 
        align="end"
        alignOffset={isMobile ? 0 : -10}
        sideOffset={isMobile ? 10 : 0}
      >
        <div className="flex items-center justify-between p-4 bg-muted/50">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`p-4 ${!notification.is_read ? 'bg-muted/50' : ''} cursor-pointer hover:bg-muted`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.is_read && (
                        <Badge variant="success" className="h-1.5 w-1.5 p-0 rounded-full" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No tienes notificaciones</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
