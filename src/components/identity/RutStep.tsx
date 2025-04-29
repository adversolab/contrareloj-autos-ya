
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RutStepProps {
  rut: string;
  onRutChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const RutStep: React.FC<RutStepProps> = ({ rut, onRutChange, onSubmit, isLoading }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rut">RUT</Label>
        <Input 
          id="rut" 
          value={rut} 
          onChange={onRutChange} 
          placeholder="12.345.678-9" 
        />
        <p className="text-xs text-gray-500">
          Ingresa tu RUT en formato 12.345.678-9
        </p>
      </div>
      
      <Button 
        onClick={onSubmit} 
        disabled={isLoading || !rut}
        className="w-full bg-contrareloj hover:bg-contrareloj-dark"
      >
        {isLoading ? 'Guardando...' : 'Siguiente'}
      </Button>
    </div>
  );
};

export default RutStep;
