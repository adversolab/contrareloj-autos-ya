
import React from 'react';
import { Button } from '@/components/ui/button';
import PhotoUploader from './PhotoUploader';
import AutofactUploader from './AutofactUploader';
import FeaturesSelector from './FeaturesSelector';

interface PhotoPreview {
  id: number;
  file: File | null;
  preview: string | null;
  isMain: boolean;
}

interface PhotosAndDetailsFormProps {
  uploadedPhotos: PhotoPreview[];
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
      <div>
        <PhotoUploader 
          uploadedPhotos={uploadedPhotos}
          onImageUpload={onImageUpload}
          onDeletePhoto={onDeletePhoto}
        />
      </div>
      
      {/* Nuevo campo para Autofact Report */}
      <div className="border-t border-gray-200 pt-6">
        <AutofactUploader
          autofactReport={autofactReport}
          onAutofactReportChange={onAutofactReportChange}
        />
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <FeaturesSelector
          features={features}
          onFeatureChange={onFeatureChange}
        />
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium mb-4">Detalles adicionales</h3>
        <textarea 
          placeholder="Agrega información relevante sobre el historial del vehículo, mantenciones, documentos, etc."
          className="w-full border border-gray-300 rounded-md p-2 h-32"
          value={additionalDetails}
          onChange={onAdditionalDetailsChange}
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
          disabled={isProcessing || !autofactReport}
        >
          {isProcessing ? "Guardando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};

export default PhotosAndDetailsForm;
