
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Trash2, Image, Plus } from 'lucide-react';

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
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onFeatureChange: (category: string, feature: string, checked: boolean) => void;
  onAdditionalDetailsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDeletePhoto: (index: number) => void;
  onPrevStep: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const PhotosAndDetailsForm: React.FC<PhotosAndDetailsFormProps> = ({
  uploadedPhotos,
  features,
  additionalDetails,
  onImageUpload,
  onFeatureChange,
  onAdditionalDetailsChange,
  onDeletePhoto,
  onPrevStep,
  onSubmit,
  isProcessing
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Sube fotos de tu vehículo</h3>
        <p className="text-sm text-gray-500 mb-4">
          Las fotos de buena calidad aumentan las posibilidades de venta. Sube al menos 5 fotos. (Máximo 20)
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className="border-2 border-dashed border-gray-300 rounded-lg aspect-video flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden"
            >
              {photo.preview ? (
                <>
                  <img 
                    src={photo.preview} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2">
                    <label className="cursor-pointer bg-white text-black px-3 py-1 rounded-md text-sm">
                      Cambiar
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onImageUpload(e, photo.id)}
                      />
                    </label>
                    {!photo.isMain && (
                      <button 
                        className="bg-red-600 text-white p-1 rounded-md"
                        onClick={() => onDeletePhoto(photo.id)}
                        type="button"
                        title="Eliminar foto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {photo.id === 0 ? <Image className="h-8 w-8 text-gray-300 mb-2" /> : <Plus className="h-8 w-8 text-gray-300 mb-2" />}
                  <span className="text-sm text-gray-500 mb-2">
                    {photo.id === 0 ? 'Foto principal*' : 
                     photo.id === 1 ? 'Lateral' :
                     photo.id === 2 ? 'Interior' : 
                     photo.id === 3 ? 'Maletero' : 
                     photo.id === 4 ? 'Motor' : 'Otra'}
                  </span>
                  <label className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm">
                    Seleccionar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onImageUpload(e, photo.id)}
                    />
                  </label>
                </>
              )}
            </div>
          ))}
          
          {uploadedPhotos.length < 20 && (
            <button
              type="button"
              className="border-2 border-dashed border-gray-300 rounded-lg aspect-video flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => {
                // Create an empty input element and trigger a click event
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => onImageUpload(e as any, uploadedPhotos.length);
                input.click();
              }}
            >
              <Plus className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Agregar foto</span>
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Puedes subir hasta 20 fotos. La primera foto será la principal y no se puede eliminar.
        </p>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-medium mb-4">Características y equipamiento</h3>
        
        <Tabs defaultValue="exterior">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="exterior">Exterior</TabsTrigger>
            <TabsTrigger value="interior">Interior</TabsTrigger>
            <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
            <TabsTrigger value="confort">Confort</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exterior" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Llantas de aleación', 'Neblineros', 'Barras de techo', 'Spoiler', 'Sunroof', 'Sensores de estacionamiento', 'Cámara de retroceso', 'Espejos eléctricos', 'Faros LED'].map((item) => (
                <label key={item} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={features.exterior.includes(item)}
                    onChange={(e) => onFeatureChange('exterior', item, e.target.checked)} 
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="interior" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Tapiz de cuero', 'Asientos eléctricos', 'Asientos con memoria', 'Volante multifunción', 'Control de crucero', 'Climatizador', 'Alzavidrios eléctricos', 'Pantalla táctil', 'Android Auto/Apple CarPlay'].map((item) => (
                <label key={item} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={features.interior.includes(item)}
                    onChange={(e) => onFeatureChange('interior', item, e.target.checked)} 
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="seguridad" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Airbags frontales', 'Airbags laterales', 'Airbags de cortina', 'Frenos ABS', 'Control de estabilidad', 'Control de tracción', 'Asistente de frenado', 'Sensor de punto ciego', 'Alerta de colisión'].map((item) => (
                <label key={item} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={features.seguridad.includes(item)}
                    onChange={(e) => onFeatureChange('seguridad', item, e.target.checked)} 
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="confort" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Bluetooth', 'Sistema de sonido premium', 'Cargador inalámbrico', 'Puertos USB', 'Encendido sin llave', 'Acceso sin llave', 'Arranque por botón', 'Asientos calefaccionados', 'Volante calefaccionado'].map((item) => (
                <label key={item} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={features.confort.includes(item)}
                    onChange={(e) => onFeatureChange('confort', item, e.target.checked)} 
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
          disabled={isProcessing}
        >
          {isProcessing ? "Guardando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};

export default PhotosAndDetailsForm;
