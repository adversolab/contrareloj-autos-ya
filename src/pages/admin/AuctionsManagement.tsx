import React, { useEffect, useState } from 'react';
import { 
  getAuctions, 
  approveAuction, 
  deleteAuction, 
  pauseAuction, 
  AdminAuction 
} from '@/services/adminService';
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
import { CheckCircle, MoreHorizontal, Eye, Trash, PauseCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuctionsManagement = () => {
  const [auctions, setAuctions] = useState<AdminAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auctionToDelete, setAuctionToDelete] = useState<string | null>(null);

  const fetchAuctions = async () => {
    setLoading(true);
    const { auctions: fetchedAuctions } = await getAuctions();
    setAuctions(fetchedAuctions);
    setLoading(false);
  };

  const handleApproveAuction = async (auctionId: string) => {
    const success = await approveAuction(auctionId);
    if (success) {
      fetchAuctions();
    }
  };

  const handlePauseAuction = async (auctionId: string) => {
    const success = await pauseAuction(auctionId);
    if (success) {
      fetchAuctions();
    }
  };

  const openDeleteDialog = (auctionId: string) => {
    setAuctionToDelete(auctionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAuction = async () => {
    if (!auctionToDelete) return;
    
    const success = await deleteAuction(auctionToDelete);
    if (success) {
      fetchAuctions();
    }
    
    setDeleteDialogOpen(false);
    setAuctionToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAuctionToDelete(null);
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Subastas</h1>
        <Button onClick={fetchAuctions} variant="outline">
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando subastas...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehículo</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Precio inicial</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auctions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No se encontraron subastas
                  </TableCell>
                </TableRow>
              ) : (
                auctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell>
                      <div className="font-medium">
                        {auction.vehicle.brand} {auction.vehicle.model} {auction.vehicle.year}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {auction.id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {auction.user.first_name || ''} {auction.user.last_name || ''}
                        {!auction.user.first_name && !auction.user.last_name && 'Usuario'}
                        <div className="text-xs text-muted-foreground">
                          {auction.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      ${auction.start_price.toLocaleString('es-CL')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={auction.is_approved ? "success" : "outline"} className={auction.is_approved ? "bg-green-500" : ""}>
                          {auction.is_approved ? 'Aprobado' : 'Pendiente'}
                        </Badge>
                        <Badge variant={
                          auction.status === 'active' ? 'default' : 
                          auction.status === 'finished' ? 'secondary' :
                          auction.status === 'paused' ? 'secondary' : 'outline'
                        } className={auction.status === 'paused' ? "bg-yellow-500" : ""}>
                          {auction.status === 'active' ? 'Activa' : 
                           auction.status === 'finished' ? 'Finalizada' : 
                           auction.status === 'paused' ? 'Pausada' : 'Borrador'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!auction.is_approved && (
                            <DropdownMenuItem onClick={() => handleApproveAuction(auction.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Aprobar subasta</span>
                            </DropdownMenuItem>
                          )}
                          {auction.status === 'active' && (
                            <DropdownMenuItem onClick={() => handlePauseAuction(auction.id)}>
                              <PauseCircle className="mr-2 h-4 w-4" />
                              <span>Pausar subasta</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link to={`/subasta/${auction.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Ver subasta</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(auction.id)}>
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Eliminar subasta</span>
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
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la subasta y todos sus datos relacionados (pujas, preguntas, etc). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAuction} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AuctionsManagement;
