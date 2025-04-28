
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-contrareloj">
              CONTRA<span className="text-contrareloj-black">RELOJ</span>
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link to="/explorar" className="text-gray-700 hover:text-contrareloj font-medium">
              Explorar subastas
            </Link>
            <Link to="/vender" className="text-gray-700 hover:text-contrareloj font-medium">
              Vender un auto
            </Link>
            <Link to="/ayuda" className="text-gray-700 hover:text-contrareloj font-medium">
              Centro de ayuda
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Link to="/perfil">
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/vender">
            <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white">
              Publicar auto
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
