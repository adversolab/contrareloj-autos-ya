
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
import { ArrowLeft } from 'lucide-react';

// Refactored components
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
    loadVerificationStatus,
    goToPreviousStep
  } = useIdentityVerification();

  // Load current verification status
  useEffect(() => {
    if (isOpen) {
      loadVerificationStatus();
    }
  }, [isOpen]);

  const handleClose = () => {
    // Confirm before closing if the user is in the middle of the process
    if (step > 1 && step < 4) {
      if (window.confirm("¿Estás seguro de que quieres cerrar? Tu progreso no se guardará.")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verificación de identidad</DialogTitle>
          <DialogDescription>
            Para participar en subastas necesitas verificar tu identidad.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Verification Steps */}
          <StepsIndicator currentStep={step} />

          {/* Step 1: Enter RUT */}
          {step === 1 && (
            <RutStep 
              rut={rut}
              onRutChange={handleRutChange}
              onSubmit={handleSubmitRut}
              isLoading={isLoading}
            />
          )}

          {/* Step 2: Upload ID document (both sides) */}
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

          {/* Step 3: Upload selfie */}
          {step === 3 && (
            <SelfieStep 
              selfieFile={selfieFile}
              onSelfieFileChange={handleSelfieFileChange}
              onSubmit={handleSubmitSelfie}
              isLoading={isLoading}
            />
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <ConfirmationStep onClose={onClose} />
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          {step > 1 && step < 4 && (
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          )}
          
          <Button variant="outline" onClick={handleClose} className={step > 1 && step < 4 ? "" : "ml-auto"}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyIdentityDialog;
