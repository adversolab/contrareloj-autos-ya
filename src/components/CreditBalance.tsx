
import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import { getUserCredits } from '@/services/creditService';

interface CreditBalanceProps {
  onUpdate?: (credits: number) => void;
  showIcon?: boolean;
  className?: string;
}

const CreditBalance: React.FC<CreditBalanceProps> = ({ 
  onUpdate, 
  showIcon = true, 
  className = "" 
}) => {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCredits = async () => {
      setIsLoading(true);
      const { credits: userCredits } = await getUserCredits();
      setCredits(userCredits);
      onUpdate?.(userCredits);
      setIsLoading(false);
    };

    loadCredits();
  }, [onUpdate]);

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        {showIcon && <Coins className="w-4 h-4 mr-1 text-yellow-500" />}
        <span className="text-sm">Cargando...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <Coins className="w-4 h-4 mr-1 text-yellow-500" />}
      <span className="text-sm font-medium">{credits} créditos</span>
    </div>
  );
};

export default CreditBalance;
