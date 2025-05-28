
import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';

const carBrands = [
  { name: 'Toyota', logo: 'https://images.unsplash.com/photo-1623874514711-0f321325f318?w=100&h=60&fit=crop&crop=center' },
  { name: 'Hyundai', logo: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=100&h=60&fit=crop&crop=center' },
  { name: 'BMW', logo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&h=60&fit=crop&crop=center' },
  { name: 'Ford', logo: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=100&h=60&fit=crop&crop=center' },
  { name: 'Chevrolet', logo: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=100&h=60&fit=crop&crop=center' },
  { name: 'Volkswagen', logo: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=100&h=60&fit=crop&crop=center' },
  { name: 'Mercedes-Benz', logo: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=100&h=60&fit=crop&crop=center' },
  { name: 'Audi', logo: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=100&h=60&fit=crop&crop=center' },
  { name: 'Nissan', logo: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=100&h=60&fit=crop&crop=center' },
  { name: 'Honda', logo: 'https://images.unsplash.com/photo-1618843479619-0ca9842fac56?w=100&h=60&fit=crop&crop=center' }
];

const BrandsCarousel = () => {
  const navigate = useNavigate();

  const handleBrandClick = (brand: string) => {
    navigate(`/explorar?marca=${encodeURIComponent(brand)}`);
  };

  return (
    <section className="py-12 bg-gray-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Busca por marca</h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {carBrands.map((brand) => (
              <CarouselItem key={brand.name} className="pl-2 md:pl-4 basis-1/3 md:basis-1/5 lg:basis-1/6">
                <div 
                  onClick={() => handleBrandClick(brand.name)}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="aspect-square flex items-center justify-center mb-2">
                    <img 
                      src={brand.logo} 
                      alt={`${brand.name} logo`}
                      className="w-full h-12 object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-sm font-medium text-center text-gray-700">{brand.name}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default BrandsCarousel;
