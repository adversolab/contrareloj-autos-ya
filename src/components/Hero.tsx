
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StatsCounter from './home/StatsCounter';

const Hero = () => {
  return (
    <div className="relative bg-black text-white w-full">
      <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80")', 
          filter: 'brightness(0.7)'
        }}
      ></div>
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-20 relative z-20">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            El tiempo corre. Súmate a las subastas que mueven el motor de Chile
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Subastas rápidas y transparentes para comprar o vender cualquier vehículo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link to="/explorar">
              <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white text-lg py-6 px-8 shadow-lg">
                Explorar autos
              </Button>
            </Link>
            <Link to="/vender">
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 text-lg py-6 px-8 shadow-lg">
                Publicar vehículo
              </Button>
            </Link>
          </div>
          
          <StatsCounter />
        </div>
      </div>
    </div>
  );
};

export default Hero;
