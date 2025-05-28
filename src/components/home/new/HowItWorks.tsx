
import React from 'react';
import { Search, Gavel, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Explora',
    description: 'Navega por nuestra selección de vehículos y encuentra el que se ajuste a tus necesidades y presupuesto.',
    color: 'from-blue-500 to-blue-600',
    number: '01'
  },
  {
    icon: Gavel,
    title: 'Oferta',
    description: 'Participa en la subasta realizando ofertas seguras y transparentes antes de que finalice el tiempo.',
    color: 'from-contrareloj to-contrareloj-dark',
    number: '02'
  },
  {
    icon: CheckCircle,
    title: 'Compra',
    description: 'Si ganas la subasta, completa la compra de forma segura y ¡disfruta de tu nuevo vehículo!',
    color: 'from-green-500 to-green-600',
    number: '03'
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-contrareloj rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">¿Cómo funciona?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tres pasos simples para encontrar tu próximo vehículo en las subastas más confiables de Chile
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full h-1 bg-gradient-to-r from-blue-200 via-contrareloj/30 to-green-200 hidden lg:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center relative group">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg z-20 group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>
                  
                  {/* Icon container */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-contrareloj transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg max-w-sm mx-auto">
                    {step.description}
                  </p>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-contrareloj/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-center mt-16">
          <p className="text-gray-500 text-lg">
            ¿Tienes dudas? Visita nuestro{' '}
            <a href="/ayuda" className="text-contrareloj font-semibold hover:underline">
              centro de ayuda
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
