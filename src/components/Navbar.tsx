
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Settings, 
  LogOut, 
  Car, 
  Search, 
  MessageCircle, 
  HelpCircle,
  Menu,
  X,
  Shield,
  Coins,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import NotificationBell from './NotificationBell';
import CreditBalance from './CreditBalance';

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada exitosamente');
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    } else if (profile?.first_name) {
      return profile.first_name[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-contrareloj text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              C
            </div>
            <span className="font-bold text-xl text-contrareloj">Contrareloj</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/explorar" 
              className="flex items-center space-x-1 text-gray-700 hover:text-contrareloj transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Explorar</span>
            </Link>
            <Link 
              to="/vender" 
              className="flex items-center space-x-1 text-gray-700 hover:text-contrareloj transition-colors"
            >
              <Car className="w-4 h-4" />
              <span>Vender</span>
            </Link>
            <Link 
              to="/ayuda" 
              className="flex items-center space-x-1 text-gray-700 hover:text-contrareloj transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ayuda</span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Credit Balance - Desktop */}
                <div className="hidden md:flex items-center space-x-2">
                  <CreditBalance />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/comprar-creditos')}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Comprar
                  </Button>
                </div>

                {/* Messages */}
                <Link to="/mensajes">
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-contrareloj text-white text-sm">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">
                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {/* Mobile Credit Balance */}
                      <div className="md:hidden pt-2 pb-1">
                        <CreditBalance />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/comprar-creditos')}
                          className="text-xs w-full mt-2"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Comprar créditos
                        </Button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/perfil')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/comprar-creditos')}>
                      <Coins className="mr-2 h-4 w-4" />
                      <span>Mis Créditos</span>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Panel Admin</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                  Iniciar sesión
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')} className="bg-contrareloj hover:bg-contrareloj-dark">
                  Registrarse
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/explorar" 
                className="flex items-center space-x-2 px-2 py-2 text-gray-700 hover:text-contrareloj transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4" />
                <span>Explorar</span>
              </Link>
              <Link 
                to="/vender" 
                className="flex items-center space-x-2 px-2 py-2 text-gray-700 hover:text-contrareloj transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Car className="w-4 h-4" />
                <span>Vender</span>
              </Link>
              <Link 
                to="/ayuda" 
                className="flex items-center space-x-2 px-2 py-2 text-gray-700 hover:text-contrareloj transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Ayuda</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
