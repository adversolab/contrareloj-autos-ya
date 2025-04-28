
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative bg-black text-white">
      <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-black to-transparent z-10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80")', 
          filter: 'brightness(0.7)'
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-20 relative z-20">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            El tiempo corre, encuentra tu auto ideal
          </h1>
          <p className="text-lg mb-8">
            Subastas rápidas y transparentes para comprar o vender cualquier vehículo en Chile
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/explorar">
              <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white text-lg py-6 px-8">
                Explorar subastas
              </Button>
            </Link>
            <Link to="/vender">
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 text-lg py-6 px-8">
                Vender mi auto
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
