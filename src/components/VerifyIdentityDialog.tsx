
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, CheckCircle, X } from 'lucide-react';
import { uploadIdentityDocument, updateRutInfo, getVerificationStatus } from '@/services/vehicleService';
import { toast } from 'sonner';

interface VerifyIdentityDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerifyIdentityDialog: React.FC<VerifyIdentityDialogProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [rut, setRut] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    hasRut: false,
    hasDocuments: false,
    hasSelfie: false
  });

  // Cargar el estado de verificación actual
  useEffect(() => {
    const loadVerificationStatus = async () => {
      const status = await getVerificationStatus();
      setVerificationStatus({
        isVerified: status.isVerified,
        hasRut: status.hasRut,
        hasDocuments: status.hasDocuments,
        hasSelfie: status.hasSelfie
      });
      
      // Determinar el paso inicial
      if (!status.hasRut) {
        setStep(1);
      } else if (!status.hasDocuments) {
        setStep(2);
      } else if (!status.hasSelfie) {
        setStep(3);
      } else {
        setStep(4);
      }
    };
    
    if (isOpen) {
      loadVerificationStatus();
    }
  }, [isOpen]);

  const formatRut = (value: string) => {
    // Eliminar todo lo que no sea número o K
    const cleaned = value.replace(/[^0-9kK]/g, '');
    
    // Si está vacío, devolver vacío
    if (!cleaned) return '';
    
    // Separar el dígito verificador
    const dv = cleaned.slice(-1);
    const numbers = cleaned.slice(0, -1);
    
    // Formatear con puntos
    const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formatted}-${dv}`;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRut(formatRut(e.target.value));
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieFile(e.target.files[0]);
    }
  };

  const handleSubmitRut = async () => {
    setIsLoading(true);
    
    try {
      const { success } = await updateRutInfo(rut);
      if (success) {
        setVerificationStatus(prev => ({ ...prev, hasRut: true }));
        setStep(2);
      }
    } catch (error) {
      console.error("Error al guardar RUT:", error);
      toast.error("Error al guardar el RUT");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDocument = async () => {
    if (!documentFile) {
      toast.error("Debes seleccionar un archivo");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { url, error } = await uploadIdentityDocument(documentFile, false);
      if (url) {
        setVerificationStatus(prev => ({ ...prev, hasDocuments: true }));
        setStep(3);
      }
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast.error("Error al subir el documento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSelfie = async () => {
    if (!selfieFile) {
      toast.error("Debes seleccionar un archivo");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { url, error } = await uploadIdentityDocument(selfieFile, true);
      if (url) {
        setVerificationStatus(prev => ({ ...prev, hasSelfie: true }));
        setStep(4);
      }
    } catch (error) {
      console.error("Error al subir selfie:", error);
      toast.error("Error al subir la selfie");
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex justify-between mb-8">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-contrareloj' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${step >= 1 ? 'border-contrareloj' : 'border-gray-300'}`}>
                1
              </div>
              <span className="text-xs mt-1">RUT</span>
            </div>
            <div className={`flex-1 border-t-2 self-center ${step >= 2 ? 'border-contrareloj' : 'border-gray-300'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-contrareloj' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${step >= 2 ? 'border-contrareloj' : 'border-gray-300'}`}>
                2
              </div>
              <span className="text-xs mt-1">Documento</span>
            </div>
            <div className={`flex-1 border-t-2 self-center ${step >= 3 ? 'border-contrareloj' : 'border-gray-300'}`}></div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-contrareloj' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${step >= 3 ? 'border-contrareloj' : 'border-gray-300'}`}>
                3
              </div>
              <span className="text-xs mt-1">Selfie</span>
            </div>
          </div>

          {/* Paso 1: Ingresar RUT */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input 
                  id="rut" 
                  value={rut} 
                  onChange={handleRutChange} 
                  placeholder="12.345.678-9" 
                />
                <p className="text-xs text-gray-500">
                  Ingresa tu RUT en formato 12.345.678-9
                </p>
              </div>
              
              <Button 
                onClick={handleSubmitRut} 
                disabled={isLoading || !rut}
                className="w-full bg-contrareloj hover:bg-contrareloj-dark"
              >
                {isLoading ? 'Guardando...' : 'Siguiente'}
              </Button>
            </div>
          )}

          {/* Paso 2: Subir documento de identidad */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document">Documento de identidad</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <input
                    id="document"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleDocumentFileChange}
                  />
                  {documentFile ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{documentFile.name}</span>
                        <button onClick={() => setDocumentFile(null)}>
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={URL.createObjectURL(documentFile)} 
                          alt="Vista previa" 
                          className="max-h-full object-contain" 
                        />
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="document" className="cursor-pointer text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Haz clic para subir tu cédula o carnet</p>
                      <p className="mt-1 text-xs text-gray-500">JPG o PNG (máx. 5MB)</p>
                    </label>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleSubmitDocument} 
                disabled={isLoading || !documentFile}
                className="w-full bg-contrareloj hover:bg-contrareloj-dark"
              >
                {isLoading ? 'Subiendo...' : 'Siguiente'}
              </Button>
              
              {verificationStatus.hasRut && (
                <Button variant="ghost" onClick={() => setStep(3)} className="w-full">
                  Omitir este paso
                </Button>
              )}
            </div>
          )}

          {/* Paso 3: Subir selfie */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selfie">Selfie con tu documento</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <input
                    id="selfie"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelfieFileChange}
                  />
                  {selfieFile ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{selfieFile.name}</span>
                        <button onClick={() => setSelfieFile(null)}>
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                      <div className="h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={URL.createObjectURL(selfieFile)} 
                          alt="Vista previa" 
                          className="max-h-full object-contain" 
                        />
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="selfie" className="cursor-pointer text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Haz clic para subir una selfie sosteniendo tu documento</p>
                      <p className="mt-1 text-xs text-gray-500">JPG o PNG (máx. 5MB)</p>
                    </label>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={handleSubmitSelfie} 
                disabled={isLoading || !selfieFile}
                className="w-full bg-contrareloj hover:bg-contrareloj-dark"
              >
                {isLoading ? 'Subiendo...' : 'Finalizar'}
              </Button>
              
              {verificationStatus.hasDocuments && (
                <Button variant="ghost" onClick={() => setStep(4)} className="w-full">
                  Omitir este paso
                </Button>
              )}
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {step === 4 && (
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
