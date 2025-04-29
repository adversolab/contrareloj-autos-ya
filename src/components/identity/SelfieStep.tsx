
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, X, AlertCircle } from 'lucide-react';

interface SelfieStepProps {
  selfieFile: File | null;
  onSelfieFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const SelfieStep: React.FC<SelfieStepProps> = ({
  selfieFile,
  onSelfieFileChange,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-4 rounded-md mb-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700 font-semibold">
              Este paso es obligatorio.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Para verificar tu identidad, necesitamos una foto tuya sosteniendo tu documento donde se vea tu rostro completamente descubierto.
            </p>
          </div>
        </div>
      </div>
    
      <div className="space-y-2">
        <Label htmlFor="selfie">Selfie con tu documento</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          <input
            id="selfie"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelfieFileChange}
          />
          {selfieFile ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{selfieFile.name}</span>
                <button onClick={() => document.getElementById('selfie')?.click()}>
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
              <p className="mt-2 text-sm text-gray-600">Haz clic para subir una selfie con tu rostro descubierto sosteniendo tu documento</p>
              <p className="mt-1 text-xs text-gray-500">JPG o PNG (máx. 5MB)</p>
            </label>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onSubmit} 
        disabled={isLoading || !selfieFile}
        className="w-full bg-contrareloj hover:bg-contrareloj-dark"
      >
        {isLoading ? 'Subiendo...' : 'Finalizar'}
      </Button>
    </div>
  );
};

export default SelfieStep;
