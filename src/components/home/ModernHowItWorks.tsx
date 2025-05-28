
import React from 'react';
import { Search, Gavel, CheckCircle } from 'lucide-react';

const ModernHowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: 'Explora',
      description: 'Navega por nuestra selección de vehículos y encuentra el que se ajuste a tus necesidades.',
      color: 'bg-blue-500'
    },
    {
      icon: Gavel,
      title: 'Oferta',
      description: 'Participa en la subasta realizando ofertas seguras antes de que finalice el tiempo.',
      color: 'bg-orange-500'
    },
    {
      icon: CheckCircle,
      title: 'Compra',
      description: 'Si ganas la subasta, completa la compra y ¡disfruta de tu nuevo vehículo!',
      color: 'bg-green-500'
    }
  ];

  return (
    <section className="bg-gray-50 py-16 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">¿Cómo funciona?</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Tres pasos simples para encontrar tu próximo vehículo
        </p>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full h-0.5 bg-gray-300 hidden lg:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center relative">
                  {/* Step number circle */}
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Step number badge */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 z-20">
                    {index + 1}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHowItWorks;
