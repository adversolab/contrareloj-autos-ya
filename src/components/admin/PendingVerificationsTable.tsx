
import React from 'react';
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
import { MoreHorizontal, CheckCircle, FileText } from 'lucide-react';
import SendMessageDialog from './SendMessageDialog';

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
  const getUserDisplayName = (user: AdminUser) => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || 'User';
  };

  if (pendingUsers.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Pending Verifications</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Documents Status</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingUsers.map((user) => (
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
                  {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : ''}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Botón directo para enviar mensaje */}
                    <SendMessageDialog
                      userId={user.id}
                      userName={getUserDisplayName(user)}
                      userEmail={user.email}
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
                          <span>View documents</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onVerifyUser(user.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Verify user</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PendingVerificationsTable;
