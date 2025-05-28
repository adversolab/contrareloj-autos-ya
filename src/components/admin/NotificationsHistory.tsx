
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Bell, Calendar, User, Filter, RefreshCw, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
  type: string;
  sent_by?: string;
  user_email?: string;
  user_first_name?: string | null;
  user_last_name?: string | null;
  admin_email?: string;
  admin_first_name?: string | null;
  admin_last_name?: string | null;
}

const NotificationsHistory: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [readStatusFilter, setReadStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchTerm, dateFilter, readStatusFilter, typeFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      console.log('Fetching all admin notifications...');
      
      // Query notifications with type 'admin'
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          created_at,
          is_read,
          user_id,
          type,
          sent_by
        `)
        .eq('type', 'admin') // Only admin notifications
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Error al cargar notificaciones');
        return;
      }

      console.log('Fetched admin notifications:', data);

      if (!data || data.length === 0) {
        console.log('No admin notifications found');
        setNotifications([]);
        setFilteredNotifications([]);
        return;
      }

      // Fetch user and admin details for each notification
      const notificationsWithUserData = await Promise.all(
        data.map(async (notification) => {
          try {
            // Get user details
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', notification.user_id)
              .single();

            // Get admin details if sent_by exists
            let adminProfile = null;
            if (notification.sent_by) {
              const { data: adminData } = await supabase
                .from('profiles')
                .select('email, first_name, last_name')
                .eq('id', notification.sent_by)
                .single();
              adminProfile = adminData;
            }

            return {
              ...notification,
              user_email: userProfile?.email || 'Email no encontrado',
              user_first_name: userProfile?.first_name || null,
              user_last_name: userProfile?.last_name || null,
              admin_email: adminProfile?.email || '',
              admin_first_name: adminProfile?.first_name || null,
              admin_last_name: adminProfile?.last_name || null,
            };
          } catch (profileError) {
            console.error('Error fetching profile data for notification:', notification.id, profileError);
            return {
              ...notification,
              user_email: 'Error al cargar datos',
              user_first_name: null,
              user_last_name: null,
              admin_email: '',
              admin_first_name: null,
              admin_last_name: null,
            };
          }
        })
      );

      console.log('Notifications with user and admin data:', notificationsWithUserData);
      setNotifications(notificationsWithUserData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (notification.user_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (`${notification.user_first_name || ''} ${notification.user_last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (notification.admin_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (`${notification.admin_first_name || ''} ${notification.admin_last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(notification => {
        const notificationDate = new Date(notification.created_at);
        return notificationDate.toDateString() === filterDate.toDateString();
      });
    }

    // Read status filter
    if (readStatusFilter !== 'all') {
      filtered = filtered.filter(notification => 
        readStatusFilter === 'read' ? notification.is_read : !notification.is_read
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setReadStatusFilter('all');
    setTypeFilter('all');
  };

  const getNotificationDisplayName = (notification: NotificationHistory) => {
    const name = `${notification.user_first_name || ''} ${notification.user_last_name || ''}`.trim();
    return name || notification.user_email || 'Usuario desconocido';
  };

  const getAdminDisplayName = (notification: NotificationHistory) => {
    if (!notification.sent_by) return 'Sistema';
    const name = `${notification.admin_first_name || ''} ${notification.admin_last_name || ''}`.trim();
    return name || notification.admin_email || 'Admin desconocido';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'admin':
        return 'Manual';
      case 'system':
        return 'Automático';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Historial de Notificaciones Enviadas
          </CardTitle>
          <Button onClick={fetchNotifications} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por título, usuario, admin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="date-filter">Fecha</Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="status-filter">Estado</Label>
            <Select value={readStatusFilter} onValueChange={setReadStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="read">Leídos</SelectItem>
                <SelectItem value="unread">No leídos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="type-filter">Tipo</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Manual</SelectItem>
                <SelectItem value="system">Automático</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button onClick={clearFilters} variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando notificaciones...</div>
        ) : filteredNotifications.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Enviado por</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Mensaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <div>
                          <div className="font-medium text-sm">
                            {getNotificationDisplayName(notification)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {notification.user_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <UserCheck className="mr-2 h-4 w-4" />
                        <div>
                          <div className="font-medium text-sm">
                            {getAdminDisplayName(notification)}
                          </div>
                          {notification.admin_email && (
                            <div className="text-xs text-muted-foreground">
                              {notification.admin_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.type === 'admin' ? 'default' : 'secondary'}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.is_read ? "default" : "secondary"}>
                        {notification.is_read ? "Leído" : "No leído"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm" title={notification.message}>
                        {notification.message}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || dateFilter || readStatusFilter !== 'all' || typeFilter !== 'all' 
              ? 'No se encontraron notificaciones que coincidan con los filtros' 
              : 'No se han enviado notificaciones aún'
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsHistory;
