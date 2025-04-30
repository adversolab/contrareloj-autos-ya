
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { getUserNotifications, Notification, markAsRead, deleteNotification, markAllAsRead } from '@/services/notificationService';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Load notifications when component mounts or user changes
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      setLoading(true);
      const { notifications } = await getUserNotifications();
      setNotifications(notifications);
      setLoading(false);
    };
    
    fetchNotifications();
    
    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    
    // When opening the popover, mark notifications as read
    if (isOpen && unreadCount > 0) {
      handleMarkAllAsRead();
    }
  };
  
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
  };
  
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };
  
  const handleDelete = async (notificationId: string) => {
    const success = await deleteNotification(notificationId);
    if (success) {
      setNotifications(notifications.filter(n => n.id !== notificationId));
    }
  };
  
  if (!user) return null;
  
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 px-1 min-w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[10px]"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-8"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tienes notificaciones
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors relative",
                    !notification.is_read && "bg-muted/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute top-2 right-2 opacity-20 hover:opacity-100"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <span className="sr-only">Eliminar</span>
                      <span aria-hidden="true">&times;</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs h-6"
                      >
                        Marcar como leída
                      </Button>
                    )}
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
