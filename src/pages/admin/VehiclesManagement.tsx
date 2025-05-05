
import React, { useEffect, useState } from 'react';
import { 
  getVehicles, 
  approveVehicle, 
  deleteVehicle 
} from '@/services/admin/vehicleService';
import { AdminVehicle } from '@/services/admin/types';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, MoreHorizontal, Trash } from 'lucide-react';

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    const { vehicles: fetchedVehicles } = await getVehicles();
    setVehicles(fetchedVehicles);
    setLoading(false);
  };

  const handleApproveVehicle = async (vehicleId: string) => {
    setOpenDropdown(null); // Close dropdown after action
    const success = await approveVehicle(vehicleId);
    if (success) {
      fetchVehicles();
    }
  };

  const openDeleteDialog = (vehicleId: string) => {
    setOpenDropdown(null); // Close dropdown after action
    setVehicleToDelete(vehicleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    const success = await deleteVehicle(vehicleToDelete);
    if (success) {
      fetchVehicles();
    }
    
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicle Management</h1>
        <Button onClick={fetchVehicles} variant="outline">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading vehicles...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No vehicles found
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="font-medium">
                        {vehicle.brand} {vehicle.model} {vehicle.year}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {vehicle.id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {vehicle.user.first_name || ''} {vehicle.user.last_name || ''}
                        {!vehicle.user.first_name && !vehicle.user.last_name && 'User'}
                        <div className="text-xs text-muted-foreground">
                          {vehicle.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehicle.is_approved ? (
                        <Badge variant="success" className="bg-green-500">Approved</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {vehicle.created_at ? format(new Date(vehicle.created_at), 'dd/MM/yyyy') : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu 
                        open={openDropdown === vehicle.id} 
                        onOpenChange={(open) => {
                          setOpenDropdown(open ? vehicle.id : null);
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!vehicle.is_approved && (
                            <DropdownMenuItem onClick={() => handleApproveVehicle(vehicle.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Approve vehicle</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(vehicle.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete vehicle</span>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the vehicle and all related data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VehiclesManagement;
