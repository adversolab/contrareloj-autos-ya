
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface BidConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bidAmount?: number; // Changed from bidAmount to match usage in AuctionDetail
  currentBid?: number; // Added to match usage in AuctionDetail
  minIncrement?: number; // Added to match usage in AuctionDetail
}

const BidConfirmationDialog: React.FC<BidConfirmationDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  bidAmount = 0, // Providing default values to prevent undefined errors
  currentBid = 0,
  minIncrement = 0
}) => {
  const holdAmount = Math.round((bidAmount || currentBid) * 0.05);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
            Confirmar oferta
          </DialogTitle>
          <DialogDescription>
            Estás a punto de realizar una oferta por este vehículo.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Detalles de la oferta:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Monto de la oferta:</div>
              <div className="text-sm font-medium text-right">${(bidAmount || currentBid).toLocaleString('es-CL')}</div>
              
              <div className="text-sm text-gray-500">Comisión (5%):</div>
              <div className="text-sm font-medium text-right">${holdAmount.toLocaleString('es-CL')}</div>
              
              <div className="border-t border-gray-200 col-span-2 my-2"></div>
              
              <div className="text-sm font-medium">Total en caso de adjudicación:</div>
              <div className="text-sm font-medium text-right">${(bidAmount || currentBid).toLocaleString('es-CL')}</div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Importante:</strong> Al confirmar, aceptas el compromiso de compra si ganas la subasta.
            </p>
            <p>
              La comisión del 5% ya está incluida en el monto de tu oferta y solo se cobrará si ganas.
            </p>
            <p>
              Si haces una nueva oferta mayor, solo se considera la comisión sobre esta última oferta.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            className="bg-contrareloj hover:bg-contrareloj-dark"
            onClick={onConfirm}
          >
            Confirmar oferta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BidConfirmationDialog;
