
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

const AuctionCallToAction = () => {
  const navigate = useNavigate();
  
  const handleRedirect = () => {
    // Redirect to auth page with current URL as redirect parameter
    navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
  };
  
  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-grow">
          <h3 className="font-medium text-lg text-amber-800 mb-1">
            ¿Te interesa este vehículo?
          </h3>
          <p className="text-amber-700">
            Regístrate o inicia sesión para participar en esta subasta. 
            ¡Verifica tu cuenta y comienza a ofertar por el auto de tus sueños!
          </p>
        </div>
        <Button 
          onClick={handleRedirect} 
          className="bg-contrareloj hover:bg-contrareloj-dark text-white min-w-[150px] flex gap-2 items-center whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrarme</span>
        </Button>
      </div>
    </div>
  );
};

export default AuctionCallToAction;
