
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VehicleBasicInfo, AuctionInfo } from '@/services/vehicleService';
import { Checkbox } from "@/components/ui/checkbox";
import { PublicationService, getServiceCost } from '@/services/publicationService';
import { useSellContext } from '@/contexts/SellContext';
import CreditsSummary from './CreditsSummary';
import { Coins } from 'lucide-react';

interface ReviewAndPaymentFormProps {
  carInfo: VehicleBasicInfo;
  auctionInfo: AuctionInfo;
  onPrevStep: () => void;
  onEditInfo: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const ReviewAndPaymentForm: React.FC<ReviewAndPaymentFormProps> = ({
  carInfo,
  auctionInfo,
  onPrevStep,
  onEditInfo,
  onSubmit,
  isProcessing
}) => {
  const [accepted, setAccepted] = useState(false);
  const { userCredits, publicationServices, refreshCredits, getTotalCostInCredits } = useSellContext();

  const getServiceCredits = (serviceName: string) => {
    return getServiceCost(publicationServices, serviceName);
  };

  const getServiceDescription = (serviceName: string) => {
    const service = publicationServices.find(s => s.servicio === serviceName);
    return service?.descripcion || '';
  };

  // Calculate total credits needed
  const baseCredits = getServiceCredits('publicacion_basica');
  const verificationCredits = auctionInfo.services.includes('verification') ? getServiceCredits('verificacion_mecanica') : 0;
  const photographyCredits = auctionInfo.services.includes('photography') ? getServiceCredits('fotografia_profesional') : 0;
  const highlightCredits = auctionInfo.services.includes('highlight') ? getServiceCredits('destacar_anuncio') : 0;
  const totalCredits = baseCredits + verificationCredits + photographyCredits + highlightCredits;

  const hasEnoughCredits = userCredits >= totalCredits;

  return (
    <div className="space-y-6">
      {/* Resumen de créditos */}
      <CreditsSummary
        availableCredits={userCredits}
        requiredCredits={totalCredits}
        onRefreshCredits={refreshCredits}
      />

      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold">Resumen de tu subasta</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-gray-500 mb-1">Vehículo</h4>
              <p className="font-medium">
                {carInfo.brand ? carInfo.brand.charAt(0).toUpperCase() + carInfo.brand.slice(1) : ''} {carInfo.model} {carInfo.year}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm text-gray-500 mb-1">Precio de inicio</h4>
              <p className="font-medium">${typeof auctionInfo.startPrice === 'number' ? auctionInfo.startPrice.toLocaleString() : '0'}</p>
            </div>
            
            <div>
              <h4 className="text-sm text-gray-500 mb-1">Duración</h4>
              <p className="font-medium">{auctionInfo.durationDays} días</p>
            </div>
            
            <div>
              <h4 className="text-sm text-gray-500 mb-1">Incremento mínimo</h4>
              <p className="font-medium">${typeof auctionInfo.minIncrement === 'number' ? auctionInfo.minIncrement.toLocaleString() : '0'}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-500 mb-1">Kilometraje</h4>
              <p className="font-medium">{parseInt(carInfo.kilometers).toLocaleString()} km</p>
            </div>
            
            <div>
              <h4 className="text-sm text-gray-500 mb-1">Transmisión</h4>
              <p className="font-medium">{carInfo.transmission}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEditInfo}
            >
              Editar información
            </Button>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-600" />
            Costo en créditos
          </h3>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Tarifa básica de publicación</span>
                <p className="text-xs text-gray-500">{getServiceDescription('publicacion_basica')}</p>
              </div>
              <span className="flex items-center gap-1 font-semibold">
                <Coins className="w-4 h-4 text-yellow-600" />
                {baseCredits}
              </span>
            </div>

            {auctionInfo.services.includes('verification') && (
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Verificación mecánica</span>
                  <p className="text-xs text-gray-500">{getServiceDescription('verificacion_mecanica')}</p>
                </div>
                <span className="flex items-center gap-1 font-semibold">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  {verificationCredits}
                </span>
              </div>
            )}

            {auctionInfo.services.includes('photography') && (
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Servicio de fotografía</span>
                  <p className="text-xs text-gray-500">{getServiceDescription('fotografia_profesional')}</p>
                </div>
                <span className="flex items-center gap-1 font-semibold">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  {photographyCredits}
                </span>
              </div>
            )}

            {auctionInfo.services.includes('highlight') && (
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Destacar anuncio</span>
                  <p className="text-xs text-gray-500">{getServiceDescription('destacar_anuncio')}</p>
                </div>
                <span className="flex items-center gap-1 font-semibold">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  {highlightCredits}
                </span>
              </div>
            )}
            
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold flex items-center gap-1">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  {totalCredits} créditos
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cobraremos una comisión del 5% sobre el valor final de venta solo si se concreta la transacción.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-start mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" checked={accepted} onCheckedChange={(value) => setAccepted(!!value)} />
          <label
            htmlFor="terms"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Acepto los <a href="/terminos" className="text-contrareloj hover:underline">Términos y Condiciones</a> y confirmo que la información proporcionada es correcta.
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

        {hasEnoughCredits ? (
          <Button 
            className="bg-contrareloj hover:bg-contrareloj-dark text-white"
            onClick={onSubmit}
            disabled={isProcessing || !accepted}
          >
            {isProcessing ? "Procesando..." : `Publicar usando ${totalCredits} créditos`}
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-red-600 font-medium">
              No tienes suficientes créditos para completar esta publicación.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={onEditInfo}
                disabled={isProcessing}
              >
                Desactivar servicios
              </Button>
              <Button 
                className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                onClick={() => window.open('/creditos', '_blank')}
                disabled={isProcessing}
              >
                Comprar créditos
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewAndPaymentForm;
