
import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

interface FeaturesSelectorProps {
  features: {[key: string]: string[]};
  onFeatureChange: (category: string, feature: string, checked: boolean) => void;
}

const FeaturesSelector: React.FC<FeaturesSelectorProps> = ({
  features,
  onFeatureChange
}) => {
  const featureCategories = {
    exterior: ['Llantas de aleación', 'Neblineros', 'Barras de techo', 'Spoiler', 'Sunroof', 'Sensores de estacionamiento', 'Cámara de retroceso', 'Espejos eléctricos', 'Faros LED'],
    interior: ['Tapiz de cuero', 'Asientos eléctricos', 'Asientos con memoria', 'Volante multifunción', 'Control de crucero', 'Climatizador', 'Alzavidrios eléctricos', 'Pantalla táctil', 'Android Auto/Apple CarPlay'],
    seguridad: ['Airbags frontales', 'Airbags laterales', 'Airbags de cortina', 'Frenos ABS', 'Control de estabilidad', 'Control de tracción', 'Asistente de frenado', 'Sensor de punto ciego', 'Alerta de colisión'],
    confort: ['Bluetooth', 'Sistema de sonido premium', 'Cargador inalámbrico', 'Puertos USB', 'Encendido sin llave', 'Acceso sin llave', 'Arranque por botón', 'Asientos calefaccionados', 'Volante calefaccionado']
  };

  return (
    <div>
      <h3 className="font-medium mb-4">Características y equipamiento</h3>
      
      <Tabs defaultValue="exterior">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="exterior">Exterior</TabsTrigger>
          <TabsTrigger value="interior">Interior</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          <TabsTrigger value="confort">Confort</TabsTrigger>
        </TabsList>
        
        {Object.entries(featureCategories).map(([category, items]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((item) => (
                <label key={item} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={features[category].includes(item)}
                    onChange={(e) => onFeatureChange(category, item, e.target.checked)} 
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FeaturesSelector;
