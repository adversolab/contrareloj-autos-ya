
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuctionCard from '@/components/AuctionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Tipos para las subastas
interface Auction {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para los campos del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para las subastas
  const [biddingAuctions, setBiddingAuctions] = useState<Auction[]>([]);
  const [favoriteAuctions, setFavoriteAuctions] = useState<Auction[]>([]);
  const [sellingAuctions, setSellingAuctions] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);

  // Cargar datos del perfil
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  // Redirigir a la página de autenticación si no hay usuario
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth?redirect=/perfil');
    }
  }, [user, isLoading, navigate]);

  // Obtener las subastas del usuario (mock data por ahora)
  useEffect(() => {
    if (user) {
      // Aquí normalmente haríamos peticiones a Supabase para obtener las subastas reales
      // Por ahora usamos datos mock
      setBiddingAuctions([
        {
          id: 1,
          title: 'Toyota RAV4 2.5 Limited 4x4',
          description: 'SUV familiar en excelentes condiciones. Motor 2.5L, 4x4, equipamiento full.',
          imageUrl: 'https://images.unsplash.com/photo-1568844293986-ca4c579100f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          currentBid: 18500000,
          endTime: new Date(Date.now() + 14 * 3600 * 1000), // 14 hours from now
          bidCount: 8,
        },
        {
          id: 4,
          title: 'Hyundai Tucson New TL 2.0',
          description: 'SUV compacto ideal para ciudad y carretera. Motor 2.0L, excelente rendimiento.',
          imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          currentBid: 14250000,
          endTime: new Date(Date.now() + 55 * 60 * 1000), // 55 minutes from now
          bidCount: 18,
        },
      ]);
      
      setFavoriteAuctions([
        {
          id: 3,
          title: 'Mazda 3 Sport 2.0 GT',
          description: 'Hatchback deportivo con bajo kilometraje. Motor 2.0L, interior premium.',
          imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1734&q=80',
          currentBid: 12990000,
          endTime: new Date(Date.now() + 26 * 3600 * 1000), // 26 hours from now
          bidCount: 5,
        },
        {
          id: 6,
          title: 'Kia Sportage 2.0 GSL',
          description: 'SUV moderno con gran espacio interior. Motor 2.0L, pantalla táctil, cámara retroceso.',
          imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
          currentBid: 15990000,
          endTime: new Date(Date.now() + 3 * 3600 * 1000 + 30 * 60 * 1000), // 3 hours 30 minutes from now
          bidCount: 10,
        },
      ]);
      
      setSellingAuctions([
        {
          id: 5,
          title: 'Nissan Versa Advance 1.6',
          description: 'Sedán económico y cómodo. Motor 1.6L, excelente rendimiento de combustible.',
          imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80',
          currentBid: 8500000,
          endTime: new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000), // 2 hours 15 minutes from now
          bidCount: 7,
        },
      ]);
      
      setWonAuctions([]);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    // Validar contraseña si se está cambiando
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      // Actualizar perfil
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        city: city,
      });

      // Actualizar contraseña si se proporcionó una nueva
      if (newPassword) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        
        if (error) {
          throw error;
        }
        
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Contraseña actualizada correctamente');
      }

      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Cargando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso no autorizado</h1>
            <p className="mb-6">Debes iniciar sesión para ver esta página</p>
            <Button onClick={() => navigate('/auth?redirect=/perfil')} className="bg-contrareloj hover:bg-contrareloj-dark">
              Iniciar sesión
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="flex items-center mb-4 md:mb-0">
                  <Avatar className="w-16 h-16 mr-4">
                    <AvatarFallback className="text-2xl">
                      {profile.first_name && profile.last_name 
                        ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() 
                        : profile.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {profile.first_name && profile.last_name 
                        ? `${profile.first_name} ${profile.last_name}` 
                        : 'Usuario'}
                    </h1>
                    <p className="text-gray-500">
                      Miembro desde {new Date(user.created_at || Date.now()).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  className={isEditing ? "bg-contrareloj hover:bg-contrareloj-dark" : ""}
                  onClick={() => {
                    if (isEditing) {
                      handleSaveProfile();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? 'Guardar cambios' : 'Editar perfil'}
                </Button>
              </div>
              
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <Input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Apellido</label>
                    <Input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input 
                      type="email" 
                      value={user.email || ''}
                      disabled
                      className="w-full bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <Input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Ciudad</label>
                    <Input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full"
                      placeholder="Santiago"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Cambiar contraseña</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        type="password" 
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full"
                      />
                      <Input 
                        type="password" 
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Email</h2>
                    <p>{user.email || 'No disponible'}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Teléfono</h2>
                    <p>{profile.phone || 'No especificado'}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Ciudad</h2>
                    <p>{profile.city || 'No especificada'}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-1">Estadísticas</h2>
                    <p>
                      {biddingAuctions.length} ofertas • 
                      {sellingAuctions.length} ventas • 
                      {favoriteAuctions.length} favoritos •
                      {wonAuctions.length} ganados
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="bidding" className="space-y-6">
            <TabsList className="w-full border-b">
              <TabsTrigger value="bidding" className="flex-1">
                Mis ofertas ({biddingAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">
                Favoritos ({favoriteAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="selling" className="flex-1">
                Mis ventas ({sellingAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="won" className="flex-1">
                Ganados ({wonAuctions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bidding">
              {biddingAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {biddingAuctions.map((auction) => (
                    <AuctionCard key={auction.id} {...auction} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No tienes ofertas activas</h3>
                  <p className="text-gray-500 mb-6">
                    Explora entre todas nuestras subastas y comienza a ofertar hoy mismo.
                  </p>
                  <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white" onClick={() => navigate('/explorar')}>
                    Explorar subastas
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites">
              {favoriteAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteAuctions.map((auction) => (
                    <AuctionCard key={auction.id} {...auction} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">❤️</span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No tienes favoritos</h3>
                  <p className="text-gray-500 mb-6">
                    Guarda tus subastas favoritas para seguirlas fácilmente.
                  </p>
                  <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white" onClick={() => navigate('/explorar')}>
                    Explorar subastas
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="selling">
              {sellingAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellingAuctions.map((auction) => (
                    <AuctionCard key={auction.id} {...auction} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🚗</span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No tienes autos a la venta</h3>
                  <p className="text-gray-500 mb-6">
                    Publica tu auto y véndelo al mejor precio en nuestra plataforma.
                  </p>
                  <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white" onClick={() => navigate('/vender')}>
                    Vender mi auto
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="won">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Aún no has ganado ninguna subasta</h3>
                <p className="text-gray-500 mb-6">
                  Explora entre todas nuestras subastas y comienza a ofertar hoy mismo.
                </p>
                <Button className="bg-contrareloj hover:bg-contrareloj-dark text-white" onClick={() => navigate('/explorar')}>
                  Explorar subastas
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
