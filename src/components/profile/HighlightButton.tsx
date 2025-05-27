
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Coins } from 'lucide-react';
import { highlightVehicle } from '@/services/highlightService';
import { useNavigate } from 'react-router-dom';

interface HighlightButtonProps {
  vehicleId: string;
  isHighlighted: boolean;
  onHighlightSuccess: () => void;
}

const HighlightButton: React.FC<HighlightButtonProps> = ({
  vehicleId,
  isHighlighted,
  onHighlightSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleHighlight = async () => {
    setIsProcessing(true);
    
    const result = await highlightVehicle(vehicleId);
    
    if (result.success) {
      onHighlightSuccess();
    } else if (result.error === 'insufficient_credits') {
      navigate('/comprar-creditos');
    }
    
    setIsProcessing(false);
  };

  if (isHighlighted) {
    return (
      <div className="flex items-center gap-1 text-yellow-600 text-sm">
        <Star className="w-4 h-4 fill-current" />
        <span>Destacado</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleHighlight}
      disabled={isProcessing}
      variant="outline"
      size="sm"
      className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
    >
      {isProcessing ? (
        'Procesando...'
      ) : (
        <>
          <Star className="w-4 h-4 mr-1" />
          <Coins className="w-4 h-4 mr-1" />
          Destacar (25 créditos)
        </>
      )}
    </Button>
  );
};

export default HighlightButton;
