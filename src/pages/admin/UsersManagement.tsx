
import React, { useEffect, useState } from 'react';
import { getUsers, verifyUser, updateUserRole, AdminUser, getUserDocuments, UserDocuments } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import UsersListTable from '@/components/admin/UsersListTable';
import PendingVerificationsTable from '@/components/admin/PendingVerificationsTable';
import UserDocumentsDialog from '@/components/admin/UserDocumentsDialog';

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

  // Get the current user being viewed (if any)
  const currentUserIsVerified = users.find(u => u.id === currentUserId)?.identity_verified || false;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={fetchUsers} variant="outline">
          Actualizar
        </Button>
      </div>

      {/* Users list table */}
      <UsersListTable 
        users={users}
        loading={loading}
        onViewDocuments={handleViewDocuments}
        onVerifyUser={handleVerifyUser}
        onUpdateRole={handleUpdateRole}
      />

      {/* Pending verification users section */}
      <PendingVerificationsTable 
        pendingUsers={pendingVerificationUsers}
        onViewDocuments={handleViewDocuments}
        onVerifyUser={handleVerifyUser}
      />

      {/* Dialog for viewing user documents */}
      <UserDocumentsDialog 
        open={viewingDocuments}
        onOpenChange={setViewingDocuments}
        documents={userDocuments}
        loading={loadingDocuments}
        userId={currentUserId}
        onVerifyUser={handleVerifyUser}
        isVerified={currentUserIsVerified}
      />
    </div>
  );
};

export default UsersManagement;
