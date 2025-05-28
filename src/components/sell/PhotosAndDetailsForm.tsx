
import React from 'react';
import { Button } from '@/components/ui/button';
import PhotoUploader from './PhotoUploader';
import FeaturesSelector from './FeaturesSelector';
import AutofactUploader from './AutofactUploader';
import { Info } from 'lucide-react';

interface PhotosAndDetailsFormProps {
  uploadedPhotos: Array<{
    id: number;
    file: File | null;
    preview: string | null;
    isMain: boolean;
  }>;
  features: {[key: string]: string[]};
  additionalDetails: string;
  autofactReport: File | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onFeatureChange: (category: string, feature: string, checked: boolean) => void;
  onAdditionalDetailsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAutofactReportChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto: (index: number) => void;
  onPrevStep: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const PhotosAndDetailsForm: React.FC<PhotosAndDetailsFormProps> = ({
  uploadedPhotos,
  features,
  additionalDetails,
  autofactReport,
  onImageUpload,
  onFeatureChange,
  onAdditionalDetailsChange,
  onAutofactReportChange,
  onDeletePhoto,
  onPrevStep,
  onSubmit,
  isProcessing
}) => {
  return (
    <div className="space-y-6">
      {/* Nota informativa sobre fotos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Fotos gratuitas</h4>
            <p className="text-sm text-blue-700">
              Subir las fotos no tiene costo en créditos. Mientras más fotos incluyas, mayor será la probabilidad de venta.
            </p>
          </div>
        </div>
      </div>

      {/* Subida de fotos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Fotos del vehículo *</h3>
        <PhotoUploader
          uploadedPhotos={uploadedPhotos}
          onImageUpload={onImageUpload}
          onDeletePhoto={onDeletePhoto}
        />
      </div>

      {/* Características del vehículo */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Características del vehículo</h3>
        <FeaturesSelector
          features={features}
          onFeatureChange={onFeatureChange}
        />
      </div>

      {/* Detalles adicionales */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Información adicional</h3>
        <textarea
          placeholder="Describe detalles adicionales, estado del vehículo, historial de mantenimiento, etc."
          className="w-full border border-gray-300 rounded-md p-3 h-32 resize-none"
          value={additionalDetails}
          onChange={onAdditionalDetailsChange}
        />
      </div>

      {/* Informe Autofact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Informe Autofact *</h3>
        <AutofactUploader
          autofactReport={autofactReport}
          onAutofactReportChange={onAutofactReportChange}
        />
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onPrevStep}
          disabled={isProcessing}
        >
          Atrás
        </Button>
        <Button 
          className="bg-contrareloj hover:bg-contrareloj-dark text-white"
          onClick={onSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? "Guardando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};

export default PhotosAndDetailsForm;
