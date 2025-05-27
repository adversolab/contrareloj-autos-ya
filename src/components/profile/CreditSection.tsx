
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Plus } from 'lucide-react';
import CreditBalance from '@/components/CreditBalance';
import CreditHistory from '@/components/CreditHistory';

const CreditSection = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Saldo de créditos */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Coins className="w-5 h-5 mr-2 text-yellow-600" />
              Mis Créditos
            </span>
            <Button 
              onClick={() => navigate('/comprar-creditos')}
              className="bg-contrareloj hover:bg-contrareloj-dark"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Comprar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <CreditBalance className="text-xl" />
              <p className="text-sm text-gray-600 mt-1">
                Cada puja cuesta 1 crédito
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>¿Necesitas más créditos?</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-contrareloj"
                onClick={() => navigate('/comprar-creditos')}
              >
                Ver packs disponibles
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de movimientos */}
      <CreditHistory />
    </div>
  );
};

export default CreditSection;
