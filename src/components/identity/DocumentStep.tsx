
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentStepProps {
  documentFrontFile: File | null;
  documentBackFile: File | null;
  onDocumentFrontFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDocumentBackFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const DocumentStep: React.FC<DocumentStepProps> = ({
  documentFrontFile,
  documentBackFile,
  onDocumentFrontFileChange,
  onDocumentBackFileChange,
  onSubmit,
  isLoading
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!documentFrontFile || !documentBackFile) {
      setUploadError("Debes subir ambos lados del documento");
      toast.error("Debes subir ambos lados del documento");
      return;
    }
    
    setUploadError(null);
    onSubmit();
  };

  // Reset file upload
  const handleResetFront = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const inputElement = document.getElementById('document-front') as HTMLInputElement;
    if (inputElement) inputElement.value = '';
    inputElement?.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const handleResetBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const inputElement = document.getElementById('document-back') as HTMLInputElement;
    if (inputElement) inputElement.value = '';
    inputElement?.dispatchEvent(new Event('change', { bubbles: true }));
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-4 rounded-md mb-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
          <p className="text-sm text-yellow-700">
            Este paso es obligatorio. Necesitamos fotos de ambos lados de tu documento de identidad.
          </p>
        </div>
      </div>
    
      {/* Frente del documento */}
      <div className="space-y-2">
        <Label htmlFor="document-front">Frente de tu cédula/carnet</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          <input
            id="document-front"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onDocumentFrontFileChange}
          />
          {documentFrontFile ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{documentFrontFile.name}</span>
                <button onClick={handleResetFront}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                <img 
                  src={URL.createObjectURL(documentFrontFile)} 
                  alt="Vista previa" 
                  className="max-h-full object-contain" 
                />
              </div>
            </div>
          ) : (
            <label htmlFor="document-front" className="cursor-pointer text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Haz clic para subir el frente de tu cédula</p>
              <p className="mt-1 text-xs text-gray-500">JPG o PNG (máx. 5MB)</p>
            </label>
          )}
        </div>
      </div>
      
      {/* Reverso del documento */}
      <div className="space-y-2">
        <Label htmlFor="document-back">Reverso de tu cédula/carnet</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
          <input
            id="document-back"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onDocumentBackFileChange}
          />
          {documentBackFile ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{documentBackFile.name}</span>
                <button onClick={handleResetBack}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                <img 
                  src={URL.createObjectURL(documentBackFile)} 
                  alt="Vista previa" 
                  className="max-h-full object-contain" 
                />
              </div>
            </div>
          ) : (
            <label htmlFor="document-back" className="cursor-pointer text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Haz clic para subir el reverso de tu cédula</p>
              <p className="mt-1 text-xs text-gray-500">JPG o PNG (máx. 5MB)</p>
            </label>
          )}
        </div>
      </div>
      
      {uploadError && (
        <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm">
          {uploadError}
        </div>
      )}
      
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading || !documentFrontFile || !documentBackFile}
        className="w-full bg-contrareloj hover:bg-contrareloj-dark"
      >
        {isLoading ? 'Subiendo...' : 'Siguiente'}
      </Button>
    </div>
  );
};

export default DocumentStep;
