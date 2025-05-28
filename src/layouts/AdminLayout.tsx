
import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, Car, Trophy, AlertTriangle, Star, CreditCard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const AdminLayout = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not admin
  React.useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/');
    }
  }, [profile, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/usuarios', icon: Users, label: 'Usuarios' },
    { path: '/admin/vehiculos', icon: Car, label: 'Vehículos' },
    { path: '/admin/subastas', icon: Trophy, label: 'Subastas' },
    { path: '/admin/creditos', icon: CreditCard, label: 'Créditos' },
    { path: '/admin/valoraciones', icon: Star, label: 'Valoraciones' },
    { path: '/admin/reportes', icon: AlertTriangle, label: 'Reportes' },
  ];

  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
          <p className="mb-6">Solo los administradores pueden acceder a esta sección</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-contrareloj">
            Panel de Administración
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {profile.first_name} {profile.last_name}
          </p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-contrareloj text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
          <Link to="/" className="block mt-2">
            <Button variant="ghost" className="w-full">
              Volver al sitio
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
