
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
import { getUsersWithNotificationStatus, UserLastNotification } from '@/services/admin/notificationService';

interface PendingVerificationsTableProps {
  pendingUsers: AdminUser[];
  onViewDocuments: (userId: string) => void;
  onVerifyUser: (userId: string) => Promise<void>;
}

const PendingVerificationsTable: React.FC<PendingVerificationsTableProps> = ({
  pendingUsers,
  onViewDocuments,
  onVerifyUser
}) => {
  const [userNotifications, setUserNotifications] = useState<Record<string, UserLastNotification>>({});

  useEffect(() => {
    if (pendingUsers.length > 0) {
      fetchUserNotifications();
    }
  }, [pendingUsers]);

  const fetchUserNotifications = async () => {
    const userIds = pendingUsers.map(user => user.id);
    console.log('Fetching notifications for users:', userIds);
    const notifications = await getUsersWithNotificationStatus(userIds);
    console.log('Received notifications:', notifications);
    setUserNotifications(notifications);
  };

  const handleMessageSent = () => {
    // Refresh notifications after sending a message
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
                      {lastNotification ? (
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
                        {/* Botón directo para enviar mensaje */}
                        <SendMessageDialog
                          userId={user.id}
                          userName={getUserDisplayName(user)}
                          userEmail={user.email}
                          onMessageSent={handleMessageSent}
                        />
                        
                        {/* Menú desplegable con otras acciones */}
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
