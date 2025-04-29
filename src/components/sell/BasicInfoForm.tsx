
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { VehicleBasicInfo } from '@/services/vehicleService';

interface BasicInfoFormProps {
  carInfo: VehicleBasicInfo;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  carInfo,
  onInputChange,
  onSelectChange,
  onSubmit,
  isProcessing
}) => {
  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Marca*</label>
          <Select 
            onValueChange={(value) => onSelectChange('brand', value)}
            value={carInfo.brand}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toyota">Toyota</SelectItem>
              <SelectItem value="chevrolet">Chevrolet</SelectItem>
              <SelectItem value="ford">Ford</SelectItem>
              <SelectItem value="hyundai">Hyundai</SelectItem>
              <SelectItem value="kia">Kia</SelectItem>
              <SelectItem value="mazda">Mazda</SelectItem>
              <SelectItem value="nissan">Nissan</SelectItem>
              <SelectItem value="subaru">Subaru</SelectItem>
              <SelectItem value="honda">Honda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Modelo*</label>
          <input 
            type="text"
            name="model"
            value={carInfo.model}
            onChange={onInputChange}
            placeholder="Ej: Corolla XEI"
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Año*</label>
          <Select 
            onValueChange={(value) => onSelectChange('year', value)}
            value={carInfo.year}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona año" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 30 }, (_, i) => 2025 - i).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Kilómetros*</label>
          <input 
            type="text"
            name="kilometers"
            value={carInfo.kilometers}
            onChange={onInputChange}
            placeholder="Ej: 45000"
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Combustible*</label>
          <Select 
            onValueChange={(value) => onSelectChange('fuel', value)}
            value={carInfo.fuel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona combustible" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasolina">Gasolina</SelectItem>
              <SelectItem value="diesel">Diésel</SelectItem>
              <SelectItem value="hibrido">Híbrido</SelectItem>
              <SelectItem value="electrico">Eléctrico</SelectItem>
              <SelectItem value="gnc">Gas Natural</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Transmisión*</label>
          <Select 
            onValueChange={(value) => onSelectChange('transmission', value)}
            value={carInfo.transmission}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona transmisión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automatica">Automática</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
              <SelectItem value="semiautomatica">Semi-automática</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Descripción general*</label>
        <textarea 
          name="description"
          value={carInfo.description}
          onChange={onInputChange}
          placeholder="Describe brevemente tu vehículo, menciona detalles importantes, estado general, etc."
          className="w-full border border-gray-300 rounded-md p-2 h-32"
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="submit"
          className="bg-contrareloj hover:bg-contrareloj-dark text-white"
          disabled={isProcessing}
        >
          {isProcessing ? "Guardando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
};

export default BasicInfoForm;
