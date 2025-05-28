
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
import { MoreHorizontal, CheckCircle, FileText, Check } from 'lucide-react';
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

  useEffect(() => {
    console.log('PendingVerificationsTable: Fetching notifications for pending users');
    if (pendingUsers.length > 0) {
      fetchUserNotifications();
    } else {
      setUserNotifications({});
    }
  }, [pendingUsers]);

  const fetchUserNotifications = async () => {
    if (pendingUsers.length === 0) {
      console.log('PendingVerificationsTable: No pending users to fetch notifications for');
      return;
    }
    
    setLoadingNotifications(true);
    console.log('PendingVerificationsTable: Starting direct Supabase query');
    
    try {
      const userIds = pendingUsers.map(user => user.id);
      console.log('PendingVerificationsTable: Querying notifications for user IDs:', userIds);
      
      // Direct Supabase query - no dependency on Lovable endpoints
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at, is_read, user_id')
        .in('user_id', userIds)
        .eq('type', 'admin')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('PendingVerificationsTable: Supabase error:', error);
        // Show visible error instead of failing silently
        setUserNotifications({});
        return;
      }

      console.log('PendingVerificationsTable: Successfully fetched notifications:', data?.length || 0);

      // Group by user_id and get the latest notification for each user
      const latestNotifications: Record<string, UserNotification> = {};
      
      if (data && data.length > 0) {
        data.forEach(notification => {
          if (!latestNotifications[notification.user_id]) {
            latestNotifications[notification.user_id] = notification;
            console.log('PendingVerificationsTable: Found notification for user:', notification.user_id);
          }
        });
      }

      console.log('PendingVerificationsTable: Setting state with notifications for users:', Object.keys(latestNotifications));
      setUserNotifications(latestNotifications);
      
    } catch (error) {
      console.error('PendingVerificationsTable: Unexpected error:', error);
      // Ensure we don't leave the UI in a broken state
      setUserNotifications({});
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMessageSent = () => {
    console.log('PendingVerificationsTable: Message sent, refreshing notifications');
    fetchUserNotifications();
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
                        <span className="text-sm text-muted-foreground">No notificado</span>
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
