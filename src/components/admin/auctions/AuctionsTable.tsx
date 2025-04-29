
import React from 'react';
import { AdminAuction } from '@/services/admin/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { CheckCircle, MoreHorizontal, Eye, Trash, PauseCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuctionsTableProps {
  auctions: AdminAuction[];
  onApprove: (auctionId: string) => void;
  onPause: (auctionId: string) => void;
  onOpenDeleteDialog: (auctionId: string) => void;
}

const AuctionsTable: React.FC<AuctionsTableProps> = ({ 
  auctions, 
  onApprove, 
  onPause, 
  onOpenDeleteDialog 
}) => {
  return (
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
                        <DropdownMenuItem onClick={() => onApprove(auction.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span>Aprobar subasta</span>
                        </DropdownMenuItem>
                      )}
                      {auction.status === 'active' && (
                        <DropdownMenuItem onClick={() => onPause(auction.id)}>
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
                      <DropdownMenuItem className="text-red-600" onClick={() => onOpenDeleteDialog(auction.id)}>
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
  );
};

export default AuctionsTable;
