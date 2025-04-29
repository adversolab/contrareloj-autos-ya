
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ConfirmationStepProps {
  onClose: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ onClose }) => {
  return (
    <div className="text-center py-6">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
      <h3 className="text-xl font-medium mb-2">¡Información recibida!</h3>
      <p className="text-gray-500 mb-6">
        Hemos recibido tu información y será revisada por nuestro equipo. Te notificaremos cuando tu cuenta sea verificada.
      </p>
      <Button onClick={onClose} className="bg-contrareloj hover:bg-contrareloj-dark">
        Entendido
      </Button>
    </div>
  );
};

export default ConfirmationStep;
