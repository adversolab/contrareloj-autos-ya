
import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const partners = [
  { name: 'Autofact', logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=60&fit=crop&crop=center' },
  { name: 'Taller Express', logo: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=120&h=60&fit=crop&crop=center' },
  { name: 'Seguros Chile', logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=120&h=60&fit=crop&crop=center' },
  { name: 'Banco Crédito', logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=120&h=60&fit=crop&crop=center' },
  { name: 'AutoFinancia', logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=60&fit=crop&crop=center' },
  { name: 'TallerPro', logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=120&h=60&fit=crop&crop=center' }
];

const PartnersSection = () => {
  return (
    <section className="py-12 bg-gray-100 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Partners que nos acompañan</h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {partners.map((partner, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center h-16">
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className="max-h-12 max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="text-sm text-center text-gray-600 mt-2">{partner.name}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default PartnersSection;
