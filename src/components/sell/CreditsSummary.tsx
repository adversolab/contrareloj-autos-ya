
import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CreditsSummaryProps {
  availableCredits: number;
  requiredCredits: number;
  onRefreshCredits: () => void;
}

const CreditsSummary: React.FC<CreditsSummaryProps> = ({
  availableCredits,
  requiredCredits,
  onRefreshCredits
}) => {
  const hasEnoughCredits = availableCredits >= requiredCredits;
  const missingCredits = requiredCredits - availableCredits;

  return (
    <div className={`border rounded-lg p-4 mb-6 ${
      hasEnoughCredits 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            hasEnoughCredits ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Coins className={`w-6 h-6 ${
              hasEnoughCredits ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">Resumen de créditos</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                💰 Créditos disponibles: <strong>{availableCredits}</strong>
              </span>
              <span className="flex items-center gap-1">
                📌 Créditos requeridos: <strong>{requiredCredits}</strong>
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {hasEnoughCredits ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">✅ Puedes completar la publicación</span>
            </div>
          ) : (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">⚠️ Te faltan {missingCredits} créditos</span>
              </div>
              <Link to="/creditos">
                <Button size="sm" className="bg-contrareloj hover:bg-contrareloj-dark text-white">
                  Comprar créditos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onRefreshCredits}
        className="mt-2 text-xs"
      >
        🔄 Actualizar saldo
      </Button>
    </div>
  );
};

export default CreditsSummary;
