
import React from 'react';
import { Button } from '@/components/ui/button';
import { File, Upload } from 'lucide-react';

interface AutofactUploaderProps {
  autofactReport: File | null;
  onAutofactReportChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AutofactUploader: React.FC<AutofactUploaderProps> = ({
  autofactReport,
  onAutofactReportChange
}) => {
  return (
    <div>
      <h3 className="font-medium mb-3">Informe Autofact</h3>
      <p className="text-sm text-gray-500 mb-4">
        Por favor, sube un informe Autofact Full en formato PDF (Obligatorio).
      </p>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
        {autofactReport ? (
          <div className="w-full text-center">
            <div className="mb-2 flex items-center justify-center">
              <File className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-sm font-medium mb-1 truncate">{autofactReport.name}</p>
            <p className="text-xs text-gray-500 mb-3">
              {(autofactReport.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <Button 
              variant="outline" 
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';
                input.onchange = (e) => {
                  // Cast the event to the right type
                  const inputEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
                  onAutofactReportChange(inputEvent);
                };
                input.click();
              }}
              className="text-sm"
            >
              Cambiar archivo
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm font-medium mb-1">Sube tu informe Autofact</p>
            <p className="text-xs text-gray-500 mb-4">
              Archivo PDF, tamaño máximo 10MB
            </p>
            <Button 
              variant="outline" 
              type="button"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';
                input.onchange = (e) => {
                  // Cast the event to the right type
                  const inputEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
                  onAutofactReportChange(inputEvent);
                };
                input.click();
              }}
              className="text-sm"
            >
              Seleccionar archivo
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AutofactUploader;
