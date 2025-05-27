
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Coins, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CREDIT_PACKS, addCreditsFromPurchase } from '@/services/creditService';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import CreditBalance from '@/components/CreditBalance';

const BuyCredits = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processingPack, setProcessingPack] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(0);

  const handlePurchase = async (packId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar créditos');
      navigate('/auth?redirect=/comprar-creditos');
      return;
    }

    const pack = CREDIT_PACKS.find(p => p.id === packId);
    if (!pack) return;

    setProcessingPack(packId);

    try {
      // Simular proceso de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Agregar créditos al usuario
      const result = await addCreditsFromPurchase(pack);
      
      if (result.success) {
        toast.success(`¡${pack.credits} créditos agregados exitosamente!`);
        // Actualizar el saldo mostrado
        setUserCredits(prev => prev + pack.credits);
      } else {
        toast.error('Error al procesar la compra');
      }
    } catch (error) {
      console.error('Error en la compra:', error);
      toast.error('Error al procesar la compra');
    } finally {
      setProcessingPack(null);
    }
  };

  const getDiscountPercentage = (pack: typeof CREDIT_PACKS[0]) => {
    const basePrice = pack.credits * 1000; // Precio base: 1000 CLP por crédito
    const discount = ((basePrice - pack.price) / basePrice) * 100;
    return Math.round(discount);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Comprar Créditos</h1>
              <p className="text-gray-600 mt-1">
                Necesitas créditos para participar en las subastas
              </p>
            </div>
          </div>

          {/* Saldo actual */}
          {user && (
            <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tu saldo actual</h3>
                    <CreditBalance 
                      onUpdate={setUserCredits}
                      className="text-lg"
                    />
                  </div>
                  <Coins className="w-12 h-12 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información sobre créditos */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">¿Cómo funcionan los créditos?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-contrareloj rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Compra créditos</h4>
                    <p className="text-sm text-gray-600">Elige el pack que mejor se adapte a tus necesidades</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-contrareloj rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Participa en subastas</h4>
                    <p className="text-sm text-gray-600">Cada puja cuesta 1 crédito</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-contrareloj rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Gana subastas</h4>
                    <p className="text-sm text-gray-600">Si no ganas, no hay costo adicional</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packs de créditos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CREDIT_PACKS.map((pack) => {
              const discount = getDiscountPercentage(pack);
              const isProcessing = processingPack === pack.id;
              
              return (
                <Card key={pack.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  {discount > 0 && (
                    <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                      -{discount}%
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Coins className="w-8 h-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-xl">{pack.name}</CardTitle>
                    <CardDescription>{pack.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center">
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-contrareloj">
                        {pack.credits}
                      </div>
                      <div className="text-sm text-gray-500">créditos</div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-2xl font-bold">
                        {formatCurrency(pack.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(Math.round(pack.price / pack.credits))} por crédito
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-contrareloj hover:bg-contrareloj-dark"
                      onClick={() => handlePurchase(pack.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Comprar
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Términos y condiciones */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Términos y condiciones</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Los créditos no tienen fecha de expiración</li>
                <li>• Cada puja en una subasta cuesta 1 crédito</li>
                <li>• Los créditos no son reembolsables</li>
                <li>• Se aplicarán penalizaciones de 10 créditos por abandono de subasta ganada</li>
                <li>• Los precios incluyen impuestos</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BuyCredits;
