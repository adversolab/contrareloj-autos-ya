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
import { getUserVehicles, getUserFavorites } from '@/services/vehicleService';
import { deleteAuctionDraft } from '@/services/auctionService';
import VerifyIdentityDialog from '@/components/VerifyIdentityDialog';
import { useSearchParams } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getUserNotifications, Notification } from '@/services/notificationService';
import { Trash2 } from 'lucide-react';

// Types for auctions
interface Auction {
  id: string | number;
  title: string;
  description: string;
  imageUrl?: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  status?: string;
  auctionId?: string | null;
}

// Type for vehicle data from API
interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  description?: string;
  created_at: string;
  photo_url?: string;
  auctions?: any[];
  // Add other vehicle fields as needed
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Auction states
  const [biddingAuctions, setBiddingAuctions] = useState<Auction[]>([]);
  const [favoriteAuctions, setFavoriteAuctions] = useState<Auction[]>([]);
  const [sellingAuctions, setSellingAuctions] = useState<Auction[]>([]);
  const [draftAuctions, setDraftAuctions] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [draftToDelete, setDraftToDelete] = useState<string | null>(null);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth?redirect=/perfil');
    }
  }, [user, isLoading, navigate]);

  // Load user vehicles
  useEffect(() => {
    const loadUserVehicles = async () => {
      if (user) {
        setIsLoadingVehicles(true);
        try {
          // Load user vehicles
          const { vehicles, drafts } = await getUserVehicles();
          
          // Format active vehicles
          if (vehicles && vehicles.length > 0) {
            const formattedVehicles: Auction[] = vehicles.map((vehicle: Vehicle) => ({
              id: vehicle.id,
              title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
              description: vehicle.description || '',
              imageUrl: vehicle.photo_url || '/placeholder.svg',
              currentBid: vehicle.auctions?.length > 0 ? vehicle.auctions[0].start_price : 0,
              endTime: vehicle.auctions?.length > 0 ? new Date(vehicle.auctions[0].end_date) : new Date(),
              bidCount: 0, // Default value
              status: vehicle.auctions?.length > 0 ? vehicle.auctions[0].status : 'draft',
              auctionId: vehicle.auctions?.length > 0 ? vehicle.auctions[0].id : null
            }));
            
            setSellingAuctions(formattedVehicles);
          }
          
          // Format draft vehicles
          if (drafts && drafts.length > 0) {
            const formattedDrafts: Auction[] = drafts.map((vehicle: Vehicle) => ({
              id: vehicle.id,
              title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
              description: vehicle.description || '',
              imageUrl: vehicle.photo_url || '/placeholder.svg',
              currentBid: vehicle.auctions?.length > 0 ? vehicle.auctions[0].start_price : 0,
              endTime: vehicle.auctions?.length > 0 ? new Date(vehicle.auctions[0].end_date) : new Date(),
              bidCount: 0, // Default value
              status: 'draft',
              auctionId: vehicle.auctions?.length > 0 ? vehicle.auctions[0].id : null
            }));
            
            setDraftAuctions(formattedDrafts);
          } else {
            setDraftAuctions([]);
          }
          
          // For now, leave other lists empty since we don't have real data
          setBiddingAuctions([]);
          setWonAuctions([]);
        } catch (error) {
          console.error("Error al cargar vehículos del usuario", error);
          toast.error("Error al cargar tus vehículos");
        } finally {
          setIsLoadingVehicles(false);
        }
      }
    };

    loadUserVehicles();
  }, [user]);

  // Load favorites
  useEffect(() => {
    const loadUserFavorites = async () => {
      if (user) {
        setIsLoadingFavorites(true);
        try {
          const { favorites, error } = await getUserFavorites();
          if (error) {
            console.error("Error al cargar favoritos:", error);
          } else if (favorites && favorites.length > 0) {
            // Transform favorites to match the Auction interface
            const formattedFavorites: Auction[] = favorites.map(favorite => ({
              id: favorite.id || '',
              title: favorite.title || '',
              description: favorite.description || '',
              imageUrl: favorite.imageUrl || '/placeholder.svg',
              currentBid: favorite.currentBid || 0,
              endTime: favorite.endTime || new Date(),
              bidCount: favorite.bidCount || 0
            }));
            
            setFavoriteAuctions(formattedFavorites);
          }
        } catch (error) {
          console.error("Error al cargar favoritos:", error);
        } finally {
          setIsLoadingFavorites(false);
        }
      }
    };

    loadUserFavorites();
  }, [user]);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (user) {
        setIsLoadingNotifications(true);
        try {
          const { notifications } = await getUserNotifications();
          setNotifications(notifications);
        } catch (error) {
          console.error("Error al cargar notificaciones:", error);
        } finally {
          setIsLoadingNotifications(false);
        }
      }
    };
    
    loadNotifications();
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

  // Helper function to safely get the user's initials
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    } else if (profile?.first_name) {
      return profile.first_name[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U'; // Default fallback
  };

  const handleDeleteDraft = (auctionId: string | null) => {
    if (!auctionId) {
      toast.error("No se pudo identificar el borrador a eliminar");
      return;
    }
    
    setDraftToDelete(auctionId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteDraft = async () => {
    if (!draftToDelete) return;
    
    const success = await deleteAuctionDraft(draftToDelete);
    if (success) {
      // Remove from state
      setDraftAuctions(draftAuctions.filter(draft => draft.auctionId !== draftToDelete));
    }
    
    setDeleteDialogOpen(false);
    setDraftToDelete(null);
  };

  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Si el usuario viene de registrarse, mostrar el diálogo de verificación
    if (searchParams.get('verify') === 'true') {
      setShowVerifyDialog(true);
    }
  }, [searchParams]);

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
                      {getInitials()}
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
          
          <Tabs defaultValue="selling" className="space-y-6">
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
              <TabsTrigger value="drafts" className="flex-1">
                Borradores ({draftAuctions.length})
              </TabsTrigger>
              <TabsTrigger value="won" className="flex-1">
                Ganados ({wonAuctions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bidding">
              {biddingAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {biddingAuctions.map((auction) => (
                    <AuctionCard 
                      key={auction.id} 
                      id={auction.id} 
                      title={auction.title} 
                      description={auction.description} 
                      imageUrl={auction.imageUrl || '/placeholder.svg'} 
                      currentBid={auction.currentBid} 
                      endTime={auction.endTime} 
                      bidCount={auction.bidCount} 
                    />
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
              {isLoadingFavorites ? (
                <div className="flex justify-center py-10">
                  <p>Cargando tus favoritos...</p>
                </div>
              ) : favoriteAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteAuctions.map((auction) => (
                    <AuctionCard 
                      key={auction.id} 
                      id={auction.id} 
                      title={auction.title} 
                      description={auction.description} 
                      imageUrl={auction.imageUrl || '/placeholder.svg'} 
                      currentBid={auction.currentBid} 
                      endTime={auction.endTime} 
                      bidCount={auction.bidCount} 
                    />
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
              {isLoadingVehicles ? (
                <div className="flex justify-center py-10">
                  <p>Cargando tus publicaciones...</p>
                </div>
              ) : sellingAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sellingAuctions.map((auction) => (
                    <AuctionCard 
                      key={auction.id} 
                      id={auction.id} 
                      title={auction.title} 
                      description={auction.description} 
                      imageUrl={auction.imageUrl || '/placeholder.svg'} 
                      currentBid={auction.currentBid} 
                      endTime={auction.endTime} 
                      bidCount={auction.bidCount} 
                      onClick={(e) => {
                        if (auction.auctionId) {
                          e.preventDefault();
                          navigate(`/subasta/${auction.auctionId}`);
                        }
                      }} 
                    />
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
            
            <TabsContent value="drafts">
              {isLoadingVehicles ? (
                <div className="flex justify-center py-10">
                  <p>Cargando tus borradores...</p>
                </div>
              ) : draftAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftAuctions.map((draft) => (
                    <div key={draft.id} className="relative">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600"
                        onClick={() => handleDeleteDraft(draft.auctionId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <AuctionCard 
                        id={draft.id} 
                        title={draft.title} 
                        description={draft.description} 
                        imageUrl={draft.imageUrl || '/placeholder.svg'} 
                        currentBid={draft.currentBid} 
                        endTime={draft.endTime} 
                        bidCount={draft.bidCount}
                        status="Borrador"
                        onClick={() => toast.info('Los borradores no se pueden ver. Por favor completa el proceso de venta.')}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">No tienes borradores</h3>
                  <p className="text-gray-500 mb-6">
                    Los borradores son publicaciones que has iniciado pero no has completado.
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
        
        {/* Sección de verificación de identidad */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Verificación de identidad</h2>
          <p className="mb-4 text-gray-600">
            Para participar en subastas necesitas verificar tu identidad. Esto nos ayuda a mantener un entorno seguro para todos los usuarios.
          </p>
          <Button 
            onClick={() => setShowVerifyDialog(true)}
            variant="outline"
            className="w-full md:w-auto"
          >
            {profile?.identity_verified ? "Ver estado de verificación" : "Verificar mi identidad"}
          </Button>
        </div>
        
        {/* Notifications section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Notificaciones</h2>
          <div className="bg-white shadow rounded-lg p-6">
            {isLoadingNotifications ? (
              <div className="text-center py-4">Cargando notificaciones...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No tienes notificaciones por ahora</div>
            ) : (
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-md ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Diálogo de verificación de identidad */}
      <VerifyIdentityDialog 
        isOpen={showVerifyDialog} 
        onClose={() => setShowVerifyDialog(false)} 
      />
      
      {/* Delete Draft Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar borrador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminarás permanentemente este borrador
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteDraft}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
