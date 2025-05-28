
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Car, Clock, Shield, Zap } from 'lucide-react';

const SellCTA = () => {
  const benefits = [
    {
      icon: Clock,
      text: 'Sin compromiso'
    },
    {
      icon: Shield,
      text: 'Evaluación gratuita'
    },
    {
      icon: Zap,
      text: 'Resultados inmediatos'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-contrareloj via-contrareloj-dark to-contrareloj-red relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <Car className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              ¿Tienes un auto para vender?
            </h2>
            <p className="text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              Evalúalo gratis en 2 minutos y véndelo al mejor precio con nuestras subastas transparentes
            </p>
          </div>
          
          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                  <IconComponent className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">{benefit.text}</span>
                </div>
              );
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto">
            <Link to="/vender" className="flex-1">
              <Button 
                size="lg"
                className="w-full bg-white text-contrareloj hover:bg-gray-100 text-xl px-10 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all"
              >
                <Car className="w-6 h-6 mr-3" />
                Publicar ahora
              </Button>
            </Link>
            <Link to="/simular-precio" className="flex-1">
              <Button 
                size="lg"
                variant="outline" 
                className="w-full border-2 border-white text-white hover:bg-white hover:text-contrareloj text-xl px-10 py-6 font-bold shadow-2xl transform hover:scale-105 transition-all"
              >
                <Zap className="w-6 h-6 mr-3" />
                Simular precio
              </Button>
            </Link>
          </div>
          
          <p className="text-white/80 text-lg mt-8 font-medium">
            Más de 10,000 autos vendidos exitosamente
          </p>
        </div>
      </div>
    </section>
  );
};

export default SellCTA;
