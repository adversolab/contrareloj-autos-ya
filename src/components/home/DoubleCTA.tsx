
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Car, Calculator } from 'lucide-react';

const DoubleCTA = () => {
  return (
    <section className="bg-gradient-to-r from-contrareloj to-contrareloj-dark py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          ¿Tienes un auto para vender?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          Véndelo de forma rápida, segura y al mejor precio con nuestras subastas.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link to="/vender" className="flex-1">
            <Button className="w-full bg-white text-contrareloj hover:bg-gray-100 text-lg px-8 py-6 shadow-lg">
              <Car className="w-5 h-5 mr-2" />
              Publicar ahora
            </Button>
          </Link>
          <Link to="/simular-precio" className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-white text-white hover:bg-white/10 text-lg px-8 py-6 shadow-lg"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Simular precio
            </Button>
          </Link>
        </div>
        
        <p className="text-white/80 text-sm mt-4">
          Sin compromisos • Evaluación gratuita • Resultados en minutos
        </p>
      </div>
    </section>
  );
};

export default DoubleCTA;
