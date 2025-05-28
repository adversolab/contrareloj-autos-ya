
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const editorialContent = [
  {
    id: 1,
    title: 'Contrareloj revoluciona el mercado automotriz',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=300&fit=crop',
    source: 'Revista Motor',
    link: '#'
  },
  {
    id: 2,
    title: 'Las mejores prácticas para vender tu auto online',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=300&fit=crop',
    source: 'AutoExpert',
    link: '#'
  },
  {
    id: 3,
    title: 'Tendencias del mercado automotriz 2024',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=300&fit=crop',
    source: 'Motor Chile',
    link: '#'
  },
  {
    id: 4,
    title: 'Cómo evaluar un auto usado antes de comprarlo',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=300&fit=crop',
    source: 'Guía Automotriz',
    link: '#'
  }
];

const EditorialCarousel = () => {
  return (
    <section className="py-12 bg-contrareloj-black text-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Lo que se comenta en la pista</h2>
        
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
                  className="block bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/20 transition-colors group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-300 mb-2">{item.source}</p>
                    <h3 className="text-lg font-semibold line-clamp-2">{item.title}</h3>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
          <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
        </Carousel>
      </div>
    </section>
  );
};

export default EditorialCarousel;
