
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  loginForm: { email: string; password: string };
  onLoginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogin: () => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onOpenChange,
  loginForm,
  onLoginChange,
  onLogin
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar sesión</DialogTitle>
          <DialogDescription>
            Por favor inicia sesión para publicar tu vehículo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={loginForm.email}
              onChange={onLoginChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña</label>
            <Input
              name="password"
              type="password"
              placeholder="********"
              value={loginForm.password}
              onChange={onLoginChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onLogin} className="bg-contrareloj hover:bg-contrareloj-dark text-white">
            Iniciar sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
