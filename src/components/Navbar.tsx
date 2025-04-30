
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, User, LogOut, Shield, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationBell from '@/components/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isAdmin = profile?.role === 'admin';
  
  // Function to determine if a nav link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <img 
              src="https://qwtevsnsivmpmikhtdmh.supabase.co/storage/v1/object/public/logos//CONTRARELOJ_LOGO.png" 
              alt="Contrareloj Logo" 
              className="h-16 md:h-20" 
            />
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/explorar" 
              className={`text-gray-700 hover:text-contrareloj font-medium px-3 py-2 rounded-md transition-colors ${isActive('/explorar') ? 'text-contrareloj border-b-2 border-contrareloj' : ''}`}
            >
              Explorar subastas
            </Link>
            <Link 
              to="/vender" 
              className={`text-gray-700 hover:text-contrareloj font-medium px-3 py-2 rounded-md transition-colors ${isActive('/vender') ? 'text-contrareloj border-b-2 border-contrareloj' : ''}`}
            >
              Vender un auto
            </Link>
            <Link 
              to="/ayuda" 
              className={`text-gray-700 hover:text-contrareloj font-medium px-3 py-2 rounded-md transition-colors ${isActive('/ayuda') ? 'text-contrareloj border-b-2 border-contrareloj' : ''}`}
            >
              Centro de ayuda
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`text-contrareloj hover:text-contrareloj-dark font-medium flex items-center px-3 py-2 rounded-md transition-colors ${isActive('/admin') ? 'bg-contrareloj/10' : ''}`}
              >
                <Shield className="h-4 w-4 mr-1" />
                Administración
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <Search className="h-5 w-5" />
          </Button>
          
          {user ? (
            <>
              <NotificationBell />
              
              <Link to="/mensajes">
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
            
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/mensajes')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Mensajes</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Administración</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          <Link to="/vender">
            <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white rounded-full font-medium">
              Publicar auto
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
