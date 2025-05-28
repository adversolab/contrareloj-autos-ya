import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
const Footer = () => {
  const quickLinks = [{
    name: 'Explorar subastas',
    href: '/explorar'
  }, {
    name: 'Vender mi auto',
    href: '/vender'
  }, {
    name: 'Centro de ayuda',
    href: '/ayuda'
  }, {
    name: 'Sobre nosotros',
    href: '/nosotros'
  }];
  const helpLinks = [{
    name: 'Cómo ofertar',
    href: '/ayuda/como-ofertar'
  }, {
    name: 'Cómo vender',
    href: '/ayuda/como-vender'
  }, {
    name: 'Preguntas frecuentes',
    href: '/ayuda/faq'
  }, {
    name: 'Contacto',
    href: '/contacto'
  }];
  const legalLinks = [{
    name: 'Términos y condiciones',
    href: '/terminos'
  }, {
    name: 'Política de privacidad',
    href: '/privacidad'
  }, {
    name: 'Política de cookies',
    href: '/cookies'
  }];
  return <footer className="bg-contrareloj-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-contrareloj-gray">
        {/* Main footer content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src="https://qwtevsnsivmpmikhtdmh.supabase.co/storage/v1/object/public/logos//contrareloj1.PNG" alt="Contrareloj" className="h-12 w-auto" />
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Subastas rápidas, confiables y transparentes para comprar o vender cualquier vehículo en Chile.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-contrareloj" />
                  <span>hola@contrareloj.cl</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-contrareloj" />
                  <span>+56 2 2345 6789</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-contrareloj" />
                  <span>Santiago, Chile</span>
                </div>
              </div>
            </div>
            
            {/* Quick links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-contrareloj">Enlaces rápidos</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => <li key={index}>
                    <Link to={link.href} className="text-gray-300 hover:text-white hover:text-contrareloj transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>)}
              </ul>
            </div>
            
            {/* Help */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-contrareloj">Ayuda</h4>
              <ul className="space-y-3">
                {helpLinks.map((link, index) => <li key={index}>
                    <Link to={link.href} className="text-gray-300 hover:text-white hover:text-contrareloj transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>)}
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-contrareloj">Legal</h4>
              <ul className="space-y-3">
                {legalLinks.map((link, index) => <li key={index}>
                    <Link to={link.href} className="text-gray-300 hover:text-white hover:text-contrareloj transition-colors duration-200">
                      {link.name}
                    </Link>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Contrareloj. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Hecho con pasión en Chile</span>
              <span className="text-lg">🇨🇱</span>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;