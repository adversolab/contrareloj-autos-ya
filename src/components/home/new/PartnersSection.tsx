
import React from 'react';

const partners = [
  { 
    name: 'Autofact', 
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=60&fit=crop&crop=center',
    description: 'Informes técnicos y evaluaciones'
  },
  { 
    name: 'Taller Express', 
    logo: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=60&fit=crop&crop=center',
    description: 'Servicios de mantención y reparación'
  },
  { 
    name: 'Seguros Chile', 
    logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&h=60&fit=crop&crop=center',
    description: 'Seguros vehiculares especializados'
  },
  { 
    name: 'Banco Crédito', 
    logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=120&h=60&fit=crop&crop=center',
    description: 'Financiamiento automotriz'
  },
  { 
    name: 'AutoFinancia', 
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=60&fit=crop&crop=center',
    description: 'Créditos para vehículos'
  },
  { 
    name: 'TallerPro', 
    logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=120&h=60&fit=crop&crop=center',
    description: 'Red de talleres certificados'
  },
  { 
    name: 'InspectAuto', 
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&h=60&fit=crop&crop=center',
    description: 'Inspecciones pre-compra'
  },
  { 
    name: 'LogiFleet', 
    logo: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=120&h=60&fit=crop&crop=center',
    description: 'Gestión de flotas'
  }
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Partners que nos acompañan</h2>
          <p className="text-xl text-gray-600">Trabajamos con las mejores empresas del sector automotriz</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {partners.map((partner, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={partner.logo} 
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{partner.name}</h3>
                <p className="text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {partner.description}
                </p>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-contrareloj/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 text-lg">
            ¿Quieres ser nuestro partner? 
            <a href="/contacto" className="text-contrareloj font-semibold hover:underline ml-2">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
