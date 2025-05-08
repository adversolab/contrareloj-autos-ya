
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface BidConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bidAmount: number;
  onConfirm: () => void;
}

const BidConfirmationDialog: React.FC<BidConfirmationDialogProps> = ({
  isOpen,
  onClose,
  bidAmount,
  onConfirm
}) => {
  const holdAmount = Math.round(bidAmount * 0.05);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar oferta</DialogTitle>
          <DialogDescription>
            Estás a punto de realizar una oferta. Por favor confirma los detalles.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500">Monto de oferta</p>
            <p className="text-2xl font-bold">{formatCurrency(bidAmount)}</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Información importante</h4>
                <ul className="text-sm text-amber-700 space-y-1 mt-1">
                  <li>Se retendrá el 5% ({formatCurrency(holdAmount)}) como garantía.</li>
                  <li>Si ganas la subasta, deberás completar la compra.</li>
                  <li>Si no completas la compra, perderás el monto retenido.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
          </DialogClose>
          <Button 
            className="bg-contrareloj hover:bg-contrareloj-dark text-white"
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
