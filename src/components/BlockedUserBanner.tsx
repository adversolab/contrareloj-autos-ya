
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldX, CreditCard, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkUserBlocked } from '@/services/creditService';

const BlockedUserBanner = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBlockedStatus = async () => {
      setIsLoading(true);
      const { blocked } = await checkUserBlocked();
      setIsBlocked(blocked);
      setIsLoading(false);
    };

    checkBlockedStatus();
  }, []);

  if (isLoading || !isBlocked) {
    return null;
  }

  return (
    <Alert className="bg-red-50 border-red-200 mb-6">
      <ShieldX className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-semibold mb-2">Cuenta Bloqueada</h4>
            <p className="text-sm">
              Tu cuenta está bloqueada por incumplimiento de subasta. 
              Regulariza tu situación comprando créditos o contactando a soporte.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => navigate('/comprar-creditos')}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Comprar Créditos
            </Button>
            <Button 
              onClick={() => navigate('/ayuda')}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contactar Soporte
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default BlockedUserBanner;
