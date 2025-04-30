
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
            {isAdmin && (
              <Link to="/admin" className="text-contrareloj hover:text-contrareloj-dark font-medium flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Administración
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          
          {user ? (
            <>
              <NotificationBell />
              
              <Link to="/mensajes">
                <Button variant="ghost" size="icon" className="relative">
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
                <DropdownMenuContent align="end">
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
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
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
