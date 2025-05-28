
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const editorialContent = [
  {
    id: 1,
    title: 'Contrareloj revoluciona el mercado automotriz chileno',
    summary: 'La plataforma de subastas online está cambiando la forma en que los chilenos compran y venden vehículos, ofreciendo transparencia y rapidez.',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=300&fit=crop',
    source: 'Revista Motor',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=50&fit=crop',
    link: '#'
  },
  {
    id: 2,
    title: 'Las mejores prácticas para vender tu auto online en 2024',
    summary: 'Expertos comparten consejos clave para maximizar el valor de tu vehículo en plataformas digitales de venta.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=300&fit=crop',
    source: 'AutoExpert Chile',
    logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=50&fit=crop',
    link: '#'
  },
  {
    id: 3,
    title: 'Tendencias del mercado automotriz: qué esperar este año',
    summary: 'Análisis completo de las marcas más demandadas, precios promedio y proyecciones para los próximos meses.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=300&fit=crop',
    source: 'Motor Chile',
    logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=50&fit=crop',
    link: '#'
  },
  {
    id: 4,
    title: 'Cómo evaluar un auto usado: guía completa para compradores',
    summary: 'Todo lo que necesitas saber antes de participar en una subasta: revisión técnica, documentos y puntos clave.',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=300&fit=crop',
    source: 'Guía Automotriz',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=50&fit=crop',
    link: '#'
  }
];

const EditorialCarousel = () => {
  return (
    <section className="py-16 bg-contrareloj-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Lo que se comenta en la pista</h2>
          <p className="text-xl text-white/80">Las últimas noticias y tendencias del mundo automotriz</p>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {editorialContent.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <a 
                  href={item.link}
                  className="block bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition-all duration-300 group h-full"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={item.logo}
                        alt={item.source}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <p className="text-sm text-white/70 font-medium">{item.source}</p>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-contrareloj transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-3">{item.summary}</p>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-white border-white/20 hover:bg-white/10 -left-12" />
          <CarouselNext className="text-white border-white/20 hover:bg-white/10 -right-12" />
        </Carousel>
      </div>
    </section>
  );
};

export default EditorialCarousel;
