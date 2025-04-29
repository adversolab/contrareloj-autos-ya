
import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIdentityVerification } from '@/hooks/useIdentityVerification';

// Componentes refactorizados
import StepsIndicator from '@/components/identity/StepsIndicator';
import RutStep from '@/components/identity/RutStep';
import DocumentStep from '@/components/identity/DocumentStep';
import SelfieStep from '@/components/identity/SelfieStep';
import ConfirmationStep from '@/components/identity/ConfirmationStep';

interface VerifyIdentityDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerifyIdentityDialog: React.FC<VerifyIdentityDialogProps> = ({ isOpen, onClose }) => {
  const {
    step,
    rut,
    documentFrontFile,
    documentBackFile,
    selfieFile,
    isLoading,
    verificationStatus,
    handleRutChange,
    handleDocumentFrontFileChange,
    handleDocumentBackFileChange,
    handleSelfieFileChange,
    handleSubmitRut,
    handleSubmitDocument,
    handleSubmitSelfie,
    loadVerificationStatus
  } = useIdentityVerification();

  // Cargar el estado de verificación actual
  useEffect(() => {
    if (isOpen) {
      loadVerificationStatus();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verificación de identidad</DialogTitle>
          <DialogDescription>
            Para participar en subastas necesitas verificar tu identidad.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Pasos de verificación */}
          <StepsIndicator currentStep={step} />

          {/* Paso 1: Ingresar RUT */}
          {step === 1 && (
            <RutStep 
              rut={rut}
              onRutChange={handleRutChange}
              onSubmit={handleSubmitRut}
              isLoading={isLoading}
            />
          )}

          {/* Paso 2: Subir documento de identidad (ambos lados) */}
          {step === 2 && (
            <DocumentStep
              documentFrontFile={documentFrontFile}
              documentBackFile={documentBackFile}
              onDocumentFrontFileChange={handleDocumentFrontFileChange}
              onDocumentBackFileChange={handleDocumentBackFileChange}
              onSubmit={handleSubmitDocument}
              isLoading={isLoading}
            />
          )}

          {/* Paso 3: Subir selfie */}
          {step === 3 && (
            <SelfieStep 
              selfieFile={selfieFile}
              onSelfieFileChange={handleSelfieFileChange}
              onSubmit={handleSubmitSelfie}
              isLoading={isLoading}
            />
          )}

          {/* Paso 4: Confirmación */}
          {step === 4 && (
            <ConfirmationStep onClose={onClose} />
          )}
        </div>

        {step < 4 && (
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VerifyIdentityDialog;
