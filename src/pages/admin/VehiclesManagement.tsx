
import React, { useEffect, useState } from 'react';
import { getVehicles, approveVehicle, AdminVehicle } from '@/services/adminService';
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
import { CheckCircle, MoreHorizontal, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const VehiclesManagement = () => {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    const { vehicles: fetchedVehicles } = await getVehicles();
    setVehicles(fetchedVehicles);
    setLoading(false);
  };

  const handleApproveVehicle = async (vehicleId: string) => {
    const success = await approveVehicle(vehicleId);
    if (success) {
      fetchVehicles();
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Vehículos</h1>
        <Button onClick={fetchVehicles} variant="outline">
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando vehículos...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No se encontraron vehículos
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="font-medium">
                        {vehicle.brand} {vehicle.model} {vehicle.year}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {vehicle.user.first_name || ''} {vehicle.user.last_name || ''}
                        {!vehicle.user.first_name && !vehicle.user.last_name && 'Usuario'}
                        <div className="text-xs text-muted-foreground">
                          {vehicle.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {vehicle.is_approved ? (
                        <Badge variant="success" className="bg-green-500">Aprobado</Badge>
                      ) : (
                        <Badge variant="outline">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {vehicle.created_at ? format(new Date(vehicle.created_at), 'dd/MM/yyyy') : ''}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!vehicle.is_approved && (
                            <DropdownMenuItem onClick={() => handleApproveVehicle(vehicle.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Aprobar vehículo</span>
                            </DropdownMenuItem>
                          )}
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
    </div>
  );
};

export default VehiclesManagement;
