
import React, { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/services/notificationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from "sonner";
import { Trash2, Mail, MailOpen, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/components/NotificationBell';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchNotifications();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { notifications: userNotifications } = await getUserNotifications();
      setNotifications(userNotifications || []);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      toast.error('No se pudieron cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      toast.success('Notificación marcada como leída');
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      toast.error('No se pudo marcar la notificación como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      toast.error('No se pudieron marcar todas las notificaciones como leídas');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      toast.error('No se pudo eliminar la notificación');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)));
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notificaciones eliminadas`);
    } catch (error) {
      console.error('Error al eliminar notificaciones seleccionadas:', error);
      toast.error('No se pudieron eliminar algunas notificaciones');
    }
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllVisible = () => {
    const visibleNotifications = getFilteredNotifications().map(n => n.id);
    setSelectedNotifications(visibleNotifications);
  };

  const unselectAll = () => {
    setSelectedNotifications([]);
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.is_read);
      case 'read':
        return notifications.filter(n => n.is_read);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const areAllSelected = filteredNotifications.length > 0 && 
    filteredNotifications.every(n => selectedNotifications.includes(n.id));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Mensajes y Notificaciones</h1>
      
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={(value) => setFilter(value as 'all' | 'unread' | 'read')}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">No leídas</TabsTrigger>
            <TabsTrigger value="read">Leídas</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2">
          {selectedNotifications.length > 0 ? (
            <>
              <Button variant="outline" size="sm" onClick={unselectAll}>
                Deseleccionar todo
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar seleccionadas ({selectedNotifications.length})
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={selectAllVisible}>
                Seleccionar todas
              </Button>
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Marcar todas como leídas
              </Button>
            </>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p>Cargando notificaciones...</p>
        </div>
      ) : filteredNotifications.length > 0 ? (
        <Card className="divide-y">
          {filteredNotifications.map(notification => (
            <div key={notification.id} className="p-4">
              <div className="flex items-start space-x-4">
                <div className="flex items-center h-5 pt-1">
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onCheckedChange={() => toggleSelectNotification(notification.id)}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {notification.is_read ? (
                        <MailOpen className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Mail className="h-5 w-5 text-blue-500" />
                      )}
                      <h3 className={`font-semibold ${!notification.is_read ? 'text-black' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h3>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className={`mt-1 ${!notification.is_read ? 'text-gray-700' : 'text-muted-foreground'}`}>
                    {notification.message}
                  </p>
                  <div className="flex justify-end mt-2 space-x-2">
                    {!notification.is_read && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                        <Check className="mr-1 h-4 w-4" /> Marcar como leída
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" 
                      onClick={() => handleDelete(notification.id)}>
                      <Trash2 className="mr-1 h-4 w-4" /> Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No hay notificaciones</h3>
          <p className="text-muted-foreground">
            {filter === 'all' 
              ? 'No tienes ninguna notificación por el momento.' 
              : filter === 'unread' 
                ? 'No tienes notificaciones sin leer.' 
                : 'No tienes notificaciones leídas.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
