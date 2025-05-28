
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/utils/formatters';
import { useSellContext } from '@/contexts/SellContext';
import { getServiceCost } from '@/services/publicationService';
import CreditsSummary from './CreditsSummary';

interface AuctionConditionsFormProps {
  auctionInfo: {
    reservePrice: number;
    startPrice: number;
    durationDays: number;
    minIncrement: number;
    services: string[];
  };
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
  const { userCredits, publicationServices, refreshCredits, getTotalCostInCredits } = useSellContext();

  const totalCostInCredits = getTotalCostInCredits();

  return (
    <div className="space-y-6">
      <CreditsSummary 
        availableCredits={userCredits}
        requiredCredits={totalCostInCredits}
        onRefreshCredits={refreshCredits}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="reservePrice">Precio de reserva *</Label>
          <Input
            id="reservePrice"
            type="number"
            value={auctionInfo.reservePrice || ''}
            onChange={(e) => onAuctionInfoChange('reservePrice', e.target.value)}
            placeholder="Precio mínimo de venta"
          />
          <p className="text-sm text-gray-500 mt-1">
            Si no se alcanza este monto, el vehículo no se vende
          </p>
        </div>

        <div>
          <Label htmlFor="startPrice">Precio inicial *</Label>
          <Input
            id="startPrice"
            type="number"
            value={auctionInfo.startPrice || ''}
            onChange={(e) => onAuctionInfoChange('startPrice', e.target.value)}
            placeholder="Precio de inicio de la subasta"
          />
          <p className="text-sm text-gray-500 mt-1">
            Precio desde el cual comenzará la subasta
          </p>
        </div>

        <div>
          <Label htmlFor="durationDays">Duración (días) *</Label>
          <Input
            id="durationDays"
            type="number"
            min="7"
            value={auctionInfo.durationDays || 7}
            onChange={(e) => onAuctionInfoChange('durationDays', parseInt(e.target.value) || 7)}
            placeholder="7"
          />
          <p className="text-sm text-gray-500 mt-1">
            Mínimo 7 días, máximo 30 días
          </p>
        </div>

        <div>
          <Label htmlFor="minIncrement">Incremento mínimo de puja 🪙</Label>
          <select
            id="minIncrement"
            value={auctionInfo.minIncrement}
            onChange={(e) => onAuctionInfoChange('minIncrement', parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value={50000}>50.000 (Recomendado)</option>
            <option value={100000}>100.000</option>
            <option value={200000}>200.000</option>
            <option value={500000}>500.000</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Monto mínimo que debe incrementar cada puja
          </p>
        </div>
      </div>

      {/* Servicios adicionales */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Servicios adicionales 🪙</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="verification"
              checked={auctionInfo.services.includes('verification')}
              onCheckedChange={(checked) => onServiceChange('verification', !!checked)}
            />
            <div className="flex-1">
              <Label htmlFor="verification" className="text-base font-medium">
                Verificación mecánica - {getServiceCost(publicationServices, 'verificacion_mecanica')} 🪙
              </Label>
              <p className="text-sm text-gray-500">
                Inspección profesional del estado mecánico del vehículo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="photography"
              checked={auctionInfo.services.includes('photography')}
              onCheckedChange={(checked) => onServiceChange('photography', !!checked)}
            />
            <div className="flex-1">
              <Label htmlFor="photography" className="text-base font-medium">
                Fotografía profesional - {getServiceCost(publicationServices, 'fotografia_profesional')} 🪙
              </Label>
              <p className="text-sm text-gray-500">
                Sesión fotográfica profesional de tu vehículo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="highlight"
              checked={auctionInfo.services.includes('highlight')}
              onCheckedChange={(checked) => onServiceChange('highlight', !!checked)}
            />
            <div className="flex-1">
              <Label htmlFor="highlight" className="text-base font-medium">
                Destacar anuncio - {getServiceCost(publicationServices, 'destacar_anuncio')} 🪙
              </Label>
              <p className="text-sm text-gray-500">
                Tu anuncio aparecerá destacado en los primeros lugares
              </p>
            </div>
          </div>
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
