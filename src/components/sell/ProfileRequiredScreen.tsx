
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProfileRequiredScreenProps {
  userProfile: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
}

const ProfileRequiredScreen: React.FC<ProfileRequiredScreenProps> = ({ userProfile }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Completa tu perfil</CardTitle>
            <CardDescription>
              Debes completar tu perfil para publicar un vehículo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Para publicar un vehículo, es necesario que completes tu información de perfil:</p>
              <ul className="list-disc pl-5 space-y-1">
                {!userProfile?.first_name && <li>Nombre</li>}
                {!userProfile?.last_name && <li>Apellido</li>}
                {!userProfile?.phone && <li>Teléfono</li>}
              </ul>
              <div className="flex justify-end">
                <Button 
                  onClick={() => navigate('/perfil?redirect=/vender')}
                  className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                >
                  Completar perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileRequiredScreen;
