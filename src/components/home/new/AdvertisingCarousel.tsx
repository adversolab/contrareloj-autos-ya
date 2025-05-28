
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const advertisements = [
  {
    id: 1,
    title: 'Financiamiento AutoCredit',
    subtitle: 'Hasta 84 cuotas sin pie',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
    cta: 'Simula tu crédito',
    link: '#',
    sponsor: 'AutoCredit'
  },
  {
    id: 2,
    title: 'Seguros Vehiculares',
    subtitle: '20% descuento primer año',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
    cta: 'Cotiza aquí',
    link: '#',
    sponsor: 'Seguros Total'
  },
  {
    id: 3,
    title: 'Inspección Pre-Compra',
    subtitle: 'Certificación profesional',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop',
    cta: 'Agenda inspección',
    link: '#',
    sponsor: 'InspectAuto'
  },
  {
    id: 4,
    title: 'Taller Especializado',
    subtitle: 'Mantención integral',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
    cta: 'Reserva hora',
    link: '#',
    sponsor: 'TallerPro'
  }
];

const AdvertisingCarousel = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Servicios recomendados</h2>
          <p className="text-xl text-gray-600">Aprovecha estas ofertas especiales de nuestros partners</p>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {advertisements.map((ad) => (
              <CarouselItem key={ad.id} className="pl-2 md:pl-4 basis-full md:basis-1/2">
                <a 
                  href={ad.link}
                  className="block bg-gradient-to-r from-contrareloj to-contrareloj-dark rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative aspect-[2/1] overflow-hidden">
                    <img 
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                      <div className="mb-2">
                        <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                          {ad.sponsor}
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{ad.title}</h3>
                      <p className="text-lg mb-6 text-white/90">{ad.subtitle}</p>
                      
                      <div className="inline-flex">
                        <span className="bg-white text-contrareloj px-6 py-3 rounded-lg font-semibold group-hover:bg-contrareloj-light transition-colors">
                          {ad.cta}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-contrareloj border-contrareloj/20 hover:bg-contrareloj/10 -left-12" />
          <CarouselNext className="text-contrareloj border-contrareloj/20 hover:bg-contrareloj/10 -right-12" />
        </Carousel>
      </div>
    </section>
  );
};

export default AdvertisingCarousel;
