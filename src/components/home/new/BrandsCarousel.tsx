
import React from 'react';
import { Link } from 'react-router-dom';

const brands = [
  { name: 'Toyota', logo: 'https://logoeps.com/wp-content/uploads/2013/03/toyota-vector-logo.png' },
  { name: 'BMW', logo: 'https://logoeps.com/wp-content/uploads/2012/11/bmw-vector-logo.png' },
  { name: 'Mercedes-Benz', logo: 'https://logoeps.com/wp-content/uploads/2013/03/mercedes-benz-vector-logo.png' },
  { name: 'Ford', logo: 'https://logoeps.com/wp-content/uploads/2013/03/ford-vector-logo.png' },
  { name: 'Chevrolet', logo: 'https://logoeps.com/wp-content/uploads/2013/03/chevrolet-vector-logo.png' },
  { name: 'Volkswagen', logo: 'https://logoeps.com/wp-content/uploads/2013/03/volkswagen-vector-logo.png' },
  { name: 'Audi', logo: 'https://logoeps.com/wp-content/uploads/2012/11/audi-vector-logo.png' },
  { name: 'Nissan', logo: 'https://logoeps.com/wp-content/uploads/2013/03/nissan-vector-logo.png' },
  { name: 'Hyundai', logo: 'https://logoeps.com/wp-content/uploads/2013/03/hyundai-vector-logo.png' },
  { name: 'Kia', logo: 'https://logoeps.com/wp-content/uploads/2013/03/kia-vector-logo.png' }
];

const BrandsCarousel = () => {
  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Busca por marca</h2>
        <p className="text-xl text-gray-600">Encuentra tu auto ideal de las marcas más reconocidas</p>
      </div>
      
      {/* Infinite scrolling carousel */}
      <div className="relative">
        <div className="flex space-x-12 animate-scroll">
          {/* First set */}
          {brands.map((brand, index) => (
            <Link
              key={`first-${index}`}
              to={`/explorar?brand=${brand.name}`}
              className="flex-shrink-0 group"
            >
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center p-6 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <p className="text-center mt-3 font-semibold text-gray-700 group-hover:text-contrareloj transition-colors">
                {brand.name}
              </p>
            </Link>
          ))}
          
          {/* Second set for infinite effect */}
          {brands.map((brand, index) => (
            <Link
              key={`second-${index}`}
              to={`/explorar?brand=${brand.name}`}
              className="flex-shrink-0 group"
            >
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center p-6 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <p className="text-center mt-3 font-semibold text-gray-700 group-hover:text-contrareloj transition-colors">
                {brand.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
      
      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .animate-scroll {
            animation: scroll 30s linear infinite;
          }
        `}
      </style>
    </section>
  );
};

export default BrandsCarousel;
