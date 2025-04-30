
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { isAdmin } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile'; // Fixed import name
import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link to={href} className={cn(
      "text-sm font-medium transition-colors hover:text-foreground/80",
      isActive ? "text-foreground" : "text-foreground/60"
    )}>
      {children}
    </Link>
  );
}

function NavLinks() {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <NavLink href="/">Inicio</NavLink>
      <NavLink href="/explorar">Explorar</NavLink>
      <NavLink href="/vender">Vender</NavLink>
    </div>
  );
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const isLoggedIn = !!user;
  const isMobile = useIsMobile(); // Updated to match the hook name
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isAdmin();
        setIsAdminUser(adminStatus);
      } else {
        setIsAdminUser(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container flex h-16 items-center">
        <Link to="/" className="mr-4 font-bold text-xl">
          Contrareloj
        </Link>
        <NavLinks />
      
        <div className="flex items-center space-x-2 ml-auto">
          {/* Add the NotificationBell component before the SignInButton */}
          {isLoggedIn && <NotificationBell />}
          <SignInButton />
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          )}
        </div>
        
        {isMobile && mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md rounded-md py-2 z-50">
            <div className="flex flex-col items-center space-y-3">
              <NavLink href="/">Inicio</NavLink>
              <NavLink href="/explorar">Explorar</NavLink>
              <NavLink href="/vender">Vender</NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function SignInButton() {
  const { user, signOut } = useAuth();
  const isLoggedIn = !!user;

  if (isLoggedIn) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/perfil">
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/vender">
              Vender vehículo
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/auth/update-password">
              Cambiar contraseña
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  } else {
    return (
      <Link to="/auth">
        <Button>
          Iniciar sesión
        </Button>
      </Link>
    );
  }
}
