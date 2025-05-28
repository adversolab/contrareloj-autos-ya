
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
import { MoreHorizontal, CheckCircle, UserCog, Shield, FileText } from 'lucide-react';
import SendMessageDialog from './SendMessageDialog';

interface UsersListTableProps {
  users: AdminUser[];
  loading: boolean;
  onViewDocuments: (userId: string) => void;
  onVerifyUser: (userId: string) => Promise<void>;
  onUpdateRole: (userId: string, role: "user" | "admin" | "moderator") => Promise<void>;
}

const UsersListTable: React.FC<UsersListTableProps> = ({
  users,
  loading,
  onViewDocuments,
  onVerifyUser,
  onUpdateRole
}) => {
  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  console.log("Rendering UsersListTable with users:", users);
  console.log("Number of users in table:", users.length);

  const getUserDisplayName = (user: AdminUser) => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || 'User';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
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
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.identity_verified ? (
                    <Badge variant="success" className="bg-green-500">Verified</Badge>
                  ) : (
                    user.has_identity_document || user.has_selfie || user.has_rut ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
                    ) : (
                      <Badge variant="outline">Not verified</Badge>
                    )
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
                        {!user.identity_verified && (
                          <DropdownMenuItem onClick={() => onVerifyUser(user.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Verify user</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onUpdateRole(user.id, "user")}>
                          <UserCog className="mr-2 h-4 w-4" />
                          <span>Set as User</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateRole(user.id, "admin")}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Set as Admin</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersListTable;
