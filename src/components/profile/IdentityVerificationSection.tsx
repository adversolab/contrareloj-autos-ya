
import React from 'react';
import { Button } from '@/components/ui/button';

interface IdentityVerificationSectionProps {
  isVerified: boolean | undefined;
  onVerifyClick: () => void;
}

const IdentityVerificationSection = ({ 
  isVerified, 
  onVerifyClick 
}: IdentityVerificationSectionProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Verificación de identidad</h2>
      <p className="mb-4 text-gray-600">
        Para participar en subastas necesitas verificar tu identidad. Esto nos ayuda a mantener un entorno seguro para todos los usuarios.
      </p>
      <Button 
        onClick={onVerifyClick}
        variant="outline"
        className="w-full md:w-auto"
      >
        {isVerified ? "Ver estado de verificación" : "Verificar mi identidad"}
      </Button>
    </div>
  );
};

export default IdentityVerificationSection;
