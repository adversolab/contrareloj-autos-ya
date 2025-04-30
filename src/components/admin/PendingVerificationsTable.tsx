
import React from 'react';
import { AdminUser } from '@/services/admin/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

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
  if (pendingUsers.length === 0) {
    return null;
  }

  return (
    <div className="mt-8" id="pending-verifications">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="text-yellow-500" />
        <h2 className="text-xl font-bold">Pending verification users ({pendingUsers.length})</h2>
      </div>
      
      <div className="rounded-md border bg-yellow-50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingUsers.map((user) => (
              <TableRow key={`pending-${user.id}`}>
                <TableCell>
                  <div className="font-medium">
                    {user.first_name || ''} {user.last_name || ''}
                    {!user.first_name && !user.last_name && 'User'}
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
                    onClick={() => onViewDocuments(user.id)}
                    className="mr-2"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View documents
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onVerifyUser(user.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify
                  </Button>
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
