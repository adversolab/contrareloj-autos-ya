
import React, { useEffect, useState } from 'react';
import { getUsers, verifyUser, updateUserRole, AdminUser, getUserDocuments } from '@/services/adminService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { CheckCircle, MoreHorizontal, UserCog, Shield, FileText } from 'lucide-react';

interface UserDocuments {
  rut?: string;
  identity_document_url?: string;
  identity_selfie_url?: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingDocuments, setViewingDocuments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userDocuments, setUserDocuments] = useState<UserDocuments | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { users: fetchedUsers } = await getUsers();
    setUsers(fetchedUsers);
    setLoading(false);
  };

  const handleVerifyUser = async (userId: string) => {
    const success = await verifyUser(userId);
    if (success) {
      fetchUsers();
      setViewingDocuments(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: "user" | "admin" | "moderator") => {
    const success = await updateUserRole(userId, role);
    if (success) {
      fetchUsers();
    }
  };

  const handleViewDocuments = async (userId: string) => {
    setCurrentUserId(userId);
    setLoadingDocuments(true);
    setViewingDocuments(true);
    
    const documents = await getUserDocuments(userId);
    setUserDocuments(documents);
    setLoadingDocuments(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={fetchUsers} variant="outline">
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando usuarios...</div>
      ) : (
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
                        <Badge variant="outline">Pendiente</Badge>
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
                          <DropdownMenuItem onClick={() => handleViewDocuments(user.id)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Ver documentos</span>
                          </DropdownMenuItem>
                          {!user.identity_verified && (
                            <DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Verificar usuario</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "user")}>
                            <UserCog className="mr-2 h-4 w-4" />
                            <span>Establecer como Usuario</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "admin")}>
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
      )}

      {/* Dialog for viewing user documents */}
      <Dialog open={viewingDocuments} onOpenChange={setViewingDocuments}>
        <DialogContent className="sm:max-w-md md:max-w-xl">
          <DialogHeader>
            <DialogTitle>Documentos de identidad del usuario</DialogTitle>
            <DialogDescription>
              Revisa los documentos de verificación del usuario antes de aprobarlo.
            </DialogDescription>
          </DialogHeader>

          {loadingDocuments ? (
            <div className="py-10 text-center">
              Cargando documentos...
            </div>
          ) : !userDocuments ? (
            <div className="py-10 text-center">
              No se encontraron documentos para este usuario.
            </div>
          ) : (
            <div className="grid gap-6 py-4">
              <div>
                <h3 className="font-medium mb-2">RUT</h3>
                <p className="p-2 bg-gray-50 rounded">{userDocuments.rut || 'No proporcionado'}</p>
              </div>
              
              {userDocuments.identity_document_url && (
                <div>
                  <h3 className="font-medium mb-2">Documento de identidad</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={userDocuments.identity_document_url} 
                      alt="Documento de identidad" 
                      className="w-full object-contain max-h-60"
                    />
                    <div className="p-3 border-t">
                      <a 
                        href={userDocuments.identity_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Ver imagen en tamaño completo
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {userDocuments.identity_selfie_url && (
                <div>
                  <h3 className="font-medium mb-2">Selfie con documento</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={userDocuments.identity_selfie_url} 
                      alt="Selfie con documento" 
                      className="w-full object-contain max-h-60"
                    />
                    <div className="p-3 border-t">
                      <a 
                        href={userDocuments.identity_selfie_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        Ver imagen en tamaño completo
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-between flex-wrap space-y-2 sm:space-y-0">
            <Button variant="outline" onClick={() => setViewingDocuments(false)}>
              Cerrar
            </Button>
            {currentUserId && !loadingDocuments && (
              <Button 
                onClick={() => handleVerifyUser(currentUserId)} 
                className="bg-contrareloj hover:bg-contrareloj-dark"
              >
                Verificar usuario
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
