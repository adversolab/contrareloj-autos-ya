
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthDialog from '@/components/sell/AuthDialog';

interface AuthRequiredScreenProps {
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: (open: boolean) => void;
}

const AuthRequiredScreen: React.FC<AuthRequiredScreenProps> = ({ 
  isAuthDialogOpen, 
  setIsAuthDialogOpen 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Iniciar sesión requerido</CardTitle>
            <CardDescription>
              Debes iniciar sesión para publicar un vehículo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Por favor inicia sesión para continuar con la publicación de tu vehículo.</p>
              <div className="flex justify-end">
                <Button 
                  onClick={() => navigate('/auth?redirect=/vender')}
                  className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                >
                  Iniciar sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onOpenChange={setIsAuthDialogOpen}
        redirectUrl="/vender"
      />
    </div>
  );
};

export default AuthRequiredScreen;
