
import React from 'react';
import { Button } from '@/components/ui/button';
import { VehicleBasicInfo, AuctionInfo } from '@/services/vehicleService';

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
  return (
    <div className="space-y-6">
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
              <p className="font-medium">${auctionInfo.startPrice.toLocaleString()}</p>
            </div>
            
            <div>
              <h4 className="text-sm text-gray-500 mb-1">Duración</h4>
              <p className="font-medium">{auctionInfo.durationDays} días</p>
            </div>
            
            <div>
              <h4 className="text-sm text-gray-500 mb-1">Incremento mínimo</h4>
              <p className="font-medium">${auctionInfo.minIncrement.toLocaleString()}</p>
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
          <h3 className="font-semibold">Detalle de costos</h3>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Tarifa básica de publicación</span>
              <span>$25.000</span>
            </div>
            <div className="flex justify-between">
              <span>Verificación mecánica</span>
              <span>{auctionInfo.services.includes('verification') ? '$80.000' : '$0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Servicio de fotografía</span>
              <span>{auctionInfo.services.includes('photography') ? '$50.000' : '$0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Destacar anuncio</span>
              <span>{auctionInfo.services.includes('highlight') ? '$30.000' : '$0'}</span>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(25000 + 
                  (auctionInfo.services.includes('verification') ? 80000 : 0) + 
                  (auctionInfo.services.includes('photography') ? 50000 : 0) + 
                  (auctionInfo.services.includes('highlight') ? 30000 : 0)
                ).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cobraremos una comisión del 5% sobre el valor final de venta solo si se concreta la transacción.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold">Método de pago</h3>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input type="radio" name="payment" className="mr-2" defaultChecked />
                <span>Tarjeta de crédito/débito</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" className="mr-2" />
                <span>Transferencia</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Número de tarjeta</label>
                <input 
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha expiración</label>
                  <input 
                    type="text"
                    placeholder="MM/AA"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVC</label>
                  <input 
                    type="text"
                    placeholder="123"
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-start mb-4">
        <input type="checkbox" className="mt-1 mr-3" />
        <p className="text-sm">
          Acepto los <a href="/terminos" className="text-contrareloj hover:underline">Términos y Condiciones</a> y confirmo que la información proporcionada es correcta.
        </p>
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
          {isProcessing ? "Procesando..." : "Pagar y publicar"}
        </Button>
      </div>
    </div>
  );
};

export default ReviewAndPaymentForm;
