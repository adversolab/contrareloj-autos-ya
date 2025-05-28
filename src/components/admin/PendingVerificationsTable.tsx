
import React, { useEffect, useState } from 'react';
import { AdminUser } from '@/services/admin/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle, FileText, Check, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SendMessageDialog from './SendMessageDialog';
import LastMessageDialog from './LastMessageDialog';
import { supabase } from '@/integrations/supabase/client';

interface PendingVerificationsTableProps {
  pendingUsers: AdminUser[];
  onViewDocuments: (userId: string) => void;
  onVerifyUser: (userId: string) => Promise<void>;
}

interface UserNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
}

const PendingVerificationsTable: React.FC<PendingVerificationsTableProps> = ({
  pendingUsers,
  onViewDocuments,
  onVerifyUser
}) => {
  const [userNotifications, setUserNotifications] = useState<Record<string, UserNotification>>({});
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    console.log('🔵 PendingVerificationsTable: useEffect triggered, pendingUsers:', pendingUsers.length);
    if (pendingUsers.length > 0) {
      fetchUserNotifications();
    } else {
      console.log('🟡 PendingVerificationsTable: No pending users, clearing notifications');
      setUserNotifications({});
      setDebugInfo('No hay usuarios pendientes');
    }
  }, [pendingUsers]);

  const fetchUserNotifications = async () => {
    if (pendingUsers.length === 0) {
      console.log('🟡 PendingVerificationsTable: No pending users to fetch notifications for');
      return;
    }
    
    setLoadingNotifications(true);
    console.log('🔵 PendingVerificationsTable: Starting fetchUserNotifications...');
    
    try {
      const userIds = pendingUsers.map(user => user.id);
      console.log('🔵 PendingVerificationsTable: Querying notifications for user IDs:', userIds);
      setDebugInfo(`🔵 Consultando notificaciones para ${userIds.length} usuarios`);
      
      // Simplified query: get ALL notifications for these users
      console.log('🔵 PendingVerificationsTable: Querying ALL notifications for users...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .in('user_id', userIds)
        .order('created_at', { ascending: false });

      console.log('🔵 PendingVerificationsTable: Raw query result:', { 
        dataCount: data?.length || 0, 
        error,
        data: data
      });

      if (error) {
        console.error('🔴 PendingVerificationsTable: Supabase error:', error);
        setDebugInfo(`🔴 Error en consulta: ${error.message}`);
        return;
      }

      // Process notifications and update state
      if (data && data.length > 0) {
        console.log('🔵 PendingVerificationsTable: Processing', data.length, 'notifications');
        
        // Group by user_id and get the latest notification for each user
        const latestNotifications: Record<string, UserNotification> = {};
        
        data.forEach(notification => {
          console.log('🔵 PendingVerificationsTable: Processing notification:', {
            id: notification.id,
            user_id: notification.user_id,
            title: notification.title,
            type: notification.type,
            created_at: notification.created_at
          });
          
          // Take the first one for each user (already ordered by created_at desc)
          if (!latestNotifications[notification.user_id]) {
            latestNotifications[notification.user_id] = notification;
            console.log('🟢 PendingVerificationsTable: Set latest notification for user:', notification.user_id);
          }
        });

        console.log('🟢 PendingVerificationsTable: Final processed notifications:', latestNotifications);
        setUserNotifications(latestNotifications);
        setDebugInfo(`🟢 Procesadas ${data.length} notificaciones, ${Object.keys(latestNotifications).length} usuarios con notificaciones`);
      } else {
        console.log('🟡 PendingVerificationsTable: No notifications found');
        setDebugInfo(`🟡 No se encontraron notificaciones para estos usuarios`);
        setUserNotifications({});
      }
      
    } catch (error) {
      console.error('🔴 PendingVerificationsTable: Unexpected error:', error);
      setDebugInfo(`🔴 Error inesperado: ${error}`);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMessageSent = () => {
    console.log('🔵 PendingVerificationsTable: Message sent, refreshing notifications in 1 second');
    setDebugInfo('🔵 Mensaje enviado, actualizando...');
    setTimeout(() => {
      fetchUserNotifications();
    }, 1000);
  };

  const getUserDisplayName = (user: AdminUser) => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || 'User';
  };

  if (pendingUsers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Usuarios Pendientes de Verificación</h2>
        
        {/* Debug panel */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="font-medium text-blue-700 mb-1">Debug Info:</div>
          <div className="text-blue-600">Estado: {debugInfo || 'Inicializando...'}</div>
          <div className="text-blue-600">Usuarios pendientes: {pendingUsers.length}</div>
          <div className="text-blue-600">Notificaciones en memoria: {Object.keys(userNotifications).length}</div>
          <div className="text-blue-600">Cargando: {loadingNotifications ? 'Sí' : 'No'}</div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Notificado</TableHead>
                <TableHead>Fecha Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => {
                const lastNotification = userNotifications[user.id];
                console.log('PendingVerificationsTable: Rendering user:', user.id, 'has notification:', !!lastNotification);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {getUserDisplayName(user)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.has_identity_document && (
                          <Badge variant="secondary" className="text-xs">
                            ID Doc
                          </Badge>
                        )}
                        {user.has_selfie && (
                          <Badge variant="secondary" className="text-xs">
                            Selfie
                          </Badge>
                        )}
                        {user.has_rut && (
                          <Badge variant="secondary" className="text-xs">
                            RUT
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {loadingNotifications ? (
                        <span className="text-sm text-muted-foreground">Cargando...</span>
                      ) : lastNotification ? (
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger>
                              <Check className="h-4 w-4 text-green-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <div className="font-medium">{lastNotification.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(lastNotification.created_at), 'dd/MM/yyyy HH:mm')}
                                </div>
                                <div className="text-xs">
                                  Estado: {lastNotification.is_read ? 'Leído' : 'No leído'}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                          <LastMessageDialog 
                            notification={lastNotification}
                            userName={getUserDisplayName(user)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">No notificado</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-3 w-3 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                No se encontraron mensajes para este usuario
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <SendMessageDialog
                          userId={user.id}
                          userName={getUserDisplayName(user)}
                          userEmail={user.email}
                          onMessageSent={handleMessageSent}
                        />
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDocuments(user.id)}>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>Ver documentos</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onVerifyUser(user.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Verificar usuario</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PendingVerificationsTable;
