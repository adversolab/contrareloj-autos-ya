
import React from 'react';
import { Image, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoPreview {
  id: number;
  file: File | null;
  preview: string | null;
  isMain: boolean;
}

interface PhotoUploaderProps {
  uploadedPhotos: PhotoPreview[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  onDeletePhoto: (index: number) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  uploadedPhotos,
  onImageUpload,
  onDeletePhoto
}) => {
  return (
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
              input.onchange = (e) => {
                // Cast the event to the right type
                const inputEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
                onImageUpload(inputEvent, uploadedPhotos.length);
              };
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
  );
};

export default PhotoUploader;
