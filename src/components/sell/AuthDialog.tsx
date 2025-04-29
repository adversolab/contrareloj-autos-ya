
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  redirectUrl?: string;
}

const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onOpenChange,
  redirectUrl = '/vender'
}) => {
  const navigate = useNavigate();

  const handleRedirectToAuth = () => {
    onOpenChange(false);
    navigate(`/auth?redirect=${encodeURIComponent(redirectUrl)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar sesión requerido</DialogTitle>
          <DialogDescription>
            Para publicar tu vehículo, necesitas iniciar sesión o crear una cuenta
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Por favor inicia sesión con tu cuenta existente o crea una cuenta nueva para continuar.
          </p>
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:order-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleRedirectToAuth} 
            className="bg-contrareloj hover:bg-contrareloj-dark text-white sm:order-2 w-full sm:w-auto"
          >
            Ir a iniciar sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
