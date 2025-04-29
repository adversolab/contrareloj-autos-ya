
import React from 'react';
import { AdminUser } from '@/services/types/adminTypes';
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
    return <div className="text-center py-8">Cargando usuarios...</div>;
  }

  // Log para verificar que recibimos todos los usuarios
  console.log("Rendering UsersListTable with users:", users);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No se encontraron usuarios
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {user.first_name || ''} {user.last_name || ''}
                      {!user.first_name && !user.last_name && 'Usuario'}
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
                    <Badge variant="success" className="bg-green-500">Verificado</Badge>
                  ) : (
                    user.has_identity_document || user.has_selfie || user.has_rut ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Pendiente</Badge>
                    ) : (
                      <Badge variant="outline">No verificado</Badge>
                    )
                  )}
                </TableCell>
                <TableCell>
                  {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : ''}
                </TableCell>
                <TableCell className="text-right">
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
                      {!user.identity_verified && (
                        <DropdownMenuItem onClick={() => onVerifyUser(user.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Verificar usuario</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onUpdateRole(user.id, "user")}>
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>Establecer como Usuario</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateRole(user.id, "admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Establecer como Admin</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
