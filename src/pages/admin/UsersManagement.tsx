
import React, { useEffect, useState } from 'react';
import { getUsers, verifyUser, updateUserRole, AdminUser, getUserDocuments, UserDocuments } from '@/services/adminService';
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
import { CheckCircle, MoreHorizontal, UserCog, Shield, FileText, AlertCircle } from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingDocuments, setViewingDocuments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userDocuments, setUserDocuments] = useState<UserDocuments | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const fetchUsers = async () => {
    console.log("Fetching users...");
    setLoading(true);
    const { users: fetchedUsers } = await getUsers();
    console.log("Fetched users:", fetchedUsers);
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
    
    console.log("Fetching documents for user:", userId);
    const documents = await getUserDocuments(userId);
    console.log("User documents:", documents);
    setUserDocuments(documents);
    setLoadingDocuments(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users who have submitted documents but are not yet verified
  const pendingVerificationUsers = users.filter(user => {
    // Si el usuario ha subido documentos o selfie o RUT pero no está verificado
    return !user.identity_verified && 
           (user.has_identity_document || user.has_selfie || user.has_rut) && 
           user.role !== 'admin'; // No need to verify admins
  });

  console.log("Pending verification users count:", pendingVerificationUsers.length);
  console.log("Pending verification users:", pendingVerificationUsers);

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

      {/* Show pending verification section */}
      {pendingVerificationUsers.length > 0 && (
        <div className="mt-8" id="pending-verifications">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-500" />
            <h2 className="text-xl font-bold">Usuarios pendientes de verificación ({pendingVerificationUsers.length})</h2>
          </div>
          
          <div className="rounded-md border bg-yellow-50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Fecha de registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVerificationUsers.map((user) => (
                  <TableRow key={`pending-${user.id}`}>
                    <TableCell>
                      <div className="font-medium">
                        {user.first_name || ''} {user.last_name || ''}
                        {!user.first_name && !user.last_name && 'Usuario'}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDocuments(user.id)}
                        className="mr-2"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver documentos
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleVerifyUser(user.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verificar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
              
              {/* Front of document */}
              {userDocuments.front_url && (
                <div>
                  <h3 className="font-medium mb-2">Documento de identidad (frontal)</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={userDocuments.front_url} 
                      alt="Frente del documento de identidad" 
                      className="w-full object-contain max-h-60"
                    />
                    <div className="p-3 border-t">
                      <a 
                        href={userDocuments.front_url} 
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

              {/* Back of document */}
              {userDocuments.back_url && (
                <div>
                  <h3 className="font-medium mb-2">Documento de identidad (reverso)</h3>
                  <div className="overflow-hidden rounded-md border">
                    <img 
                      src={userDocuments.back_url} 
                      alt="Reverso del documento de identidad" 
                      className="w-full object-contain max-h-60"
                    />
                    <div className="p-3 border-t">
                      <a 
                        href={userDocuments.back_url} 
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

              {/* Fallback for legacy format */}
              {!userDocuments.front_url && !userDocuments.back_url && userDocuments.identity_document_url && (
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

              {/* Selfie */}
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
            {currentUserId && !loadingDocuments && !users.find(u => u.id === currentUserId)?.identity_verified && (
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
