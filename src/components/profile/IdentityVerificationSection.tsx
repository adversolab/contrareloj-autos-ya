
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield } from 'lucide-react';

interface IdentityVerificationSectionProps {
  isVerified: boolean | undefined;
  onVerifyClick: () => void;
}

const IdentityVerificationSection = ({ 
  isVerified, 
  onVerifyClick 
}: IdentityVerificationSectionProps) => {
  
  // Don't show verification section if user is already verified
  if (isVerified === true) {
    return (
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-100">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-800">Identidad verificada ✅</h2>
            <p className="text-green-700">
              Tu identidad ha sido verificada exitosamente. Ya puedes participar en todas las subastas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-blue-100">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-blue-800">Verificación de identidad</h2>
          <p className="text-blue-700">
            Para participar en subastas necesitas verificar tu identidad. Esto nos ayuda a mantener un entorno seguro para todos los usuarios.
          </p>
        </div>
      </div>
      <Button 
        onClick={onVerifyClick}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Verificar mi identidad
      </Button>
    </div>
  );
};

export default IdentityVerificationSection;
