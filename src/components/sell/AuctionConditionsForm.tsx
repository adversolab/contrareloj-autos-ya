
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Coins } from 'lucide-react';
import { AuctionInfo } from '@/services/vehicleService';
import { toast } from 'sonner';

interface AuctionConditionsFormProps {
  auctionInfo: AuctionInfo;
  onAuctionInfoChange: (name: string, value: string | number) => void;
  onServiceChange: (service: string, checked: boolean) => void;
  onPrevStep: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const AuctionConditionsForm: React.FC<AuctionConditionsFormProps> = ({
  auctionInfo,
  onAuctionInfoChange,
  onServiceChange,
  onPrevStep,
  onSubmit,
  isProcessing
}) => {
  const handleDurationChange = (value: string) => {
    const days = parseInt(value);
    if (days < 7) {
      toast.info("La duración mínima de la subasta es de 7 días");
      onAuctionInfoChange('durationDays', 7);
    } else {
      onAuctionInfoChange('durationDays', days);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Precio de reserva*</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input 
              type="text"
              placeholder="Precio mínimo que aceptarás"
              className="w-full border border-gray-300 rounded-md p-2 pl-7"
              value={auctionInfo.reservePrice > 0 ? auctionInfo.reservePrice.toString() : ''}
              onChange={(e) => onAuctionInfoChange('reservePrice', e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Este precio no será visible para los compradores
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Precio de inicio*</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input 
              type="text"
              placeholder="Precio de apertura de la subasta"
              className="w-full border border-gray-300 rounded-md p-2 pl-7"
              value={auctionInfo.startPrice > 0 ? auctionInfo.startPrice.toString() : ''}
              onChange={(e) => onAuctionInfoChange('startPrice', e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sugerimos un precio atractivo para generar interés
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Duración de la subasta* (mínimo 7 días)</label>
          <Select
            value={auctionInfo.durationDays.toString()}
            onValueChange={handleDurationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona duración" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="10">10 días</SelectItem>
              <SelectItem value="14">14 días</SelectItem>
              <SelectItem value="21">21 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Incremento mínimo*</label>
          <Select
            value={auctionInfo.minIncrement.toString()}
            onValueChange={(value) => onAuctionInfoChange('minIncrement', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona incremento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50000">$50.000</SelectItem>
              <SelectItem value="100000">$100.000</SelectItem>
              <SelectItem value="200000">$200.000</SelectItem>
              <SelectItem value="500000">$500.000</SelectItem>
              <SelectItem value="1000000">$1.000.000</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Monto mínimo para cada nueva oferta
          </p>
        </div>
      </div>
      
      {/* Sección de destacar publicación */}
      <div className="border p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Destacar Publicación
        </h4>
        
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="highlight"
            checked={auctionInfo.services.includes('highlight')}
            onCheckedChange={(checked) => onServiceChange('highlight', !!checked)}
          />
          <div className="flex-1">
            <label htmlFor="highlight" className="font-medium cursor-pointer flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Destacar mi publicación
              <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Coins className="w-3 h-3" />
                25 créditos
              </div>
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Tu vehículo aparecerá en la sección "Destacados" de la página principal y tendrá mayor visibilidad para los compradores.
            </p>
          </div>
        </div>
      </div>
      
      <div className="border p-4 rounded-lg bg-gray-50">
        <h4 className="font-medium mb-3">Servicios adicionales</h4>
        
        <div className="space-y-4">
          <label className="flex items-start">
            <input 
              type="checkbox" 
              className="mt-1 mr-3"
              checked={auctionInfo.services.includes('verification')}
              onChange={(e) => onServiceChange('verification', e.target.checked)}
            />
            <div>
              <span className="font-medium">Verificación mecánica</span>
              <p className="text-sm text-gray-500">
                Un mecánico certificado realizará una inspección completa de tu vehículo para generar más confianza en los compradores. Costo: $80.000
              </p>
            </div>
          </label>
          
          <label className="flex items-start">
            <input 
              type="checkbox" 
              className="mt-1 mr-3"
              checked={auctionInfo.services.includes('photography')}
              onChange={(e) => onServiceChange('photography', e.target.checked)}
            />
            <div>
              <span className="font-medium">Servicio de fotografía profesional</span>
              <p className="text-sm text-gray-500">
                Un fotógrafo profesional tomará fotos de alta calidad de tu vehículo. Costo: $50.000
              </p>
            </div>
          </label>
        </div>
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

export default AuctionConditionsForm;
