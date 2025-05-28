
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-contrareloj-black text-white pt-12 pb-6 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CONTRARELOJ</h3>
            <p className="text-gray-300 mb-4">
              Subastas rápidas, confiables y transparentes para comprar o vender cualquier vehículo en Chile.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/explorar" className="text-gray-300 hover:text-white transition-colors">
                  Explorar subastas
                </Link>
              </li>
              <li>
                <Link to="/vender" className="text-gray-300 hover:text-white transition-colors">
                  Vender mi auto
                </Link>
              </li>
              <li>
                <Link to="/ayuda" className="text-gray-300 hover:text-white transition-colors">
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors">
                  Sobre nosotros
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Ayuda</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/ayuda/como-ofertar" className="text-gray-300 hover:text-white transition-colors">
                  Cómo ofertar
                </Link>
              </li>
              <li>
                <Link to="/ayuda/como-vender" className="text-gray-300 hover:text-white transition-colors">
                  Cómo vender
                </Link>
              </li>
              <li>
                <Link to="/ayuda/faq" className="text-gray-300 hover:text-white transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terminos" className="text-gray-300 hover:text-white transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-gray-300 hover:text-white transition-colors">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-300 hover:text-white transition-colors">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 mt-6 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Contrareloj. Todos los derechos reservados.</p>
          <div className="mt-4 md:mt-0">
            Hecho con pasión en Chile
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
