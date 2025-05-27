import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserVehicles, getUserFavorites } from '@/services/vehicleService';
import VerifyIdentityDialog from '@/components/VerifyIdentityDialog';
import { useSearchParams } from 'react-router-dom';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileTabs from '@/components/profile/ProfileTabs';
import IdentityVerificationSection from '@/components/profile/IdentityVerificationSection';
import ReputationSection from '@/components/profile/ReputationSection';
import UserRatingsSection from '@/components/profile/UserRatingsSection';
import { Auction, Vehicle } from '@/components/profile/types';
import MandatoryProfileForm from '@/components/MandatoryProfileForm';

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
  
  // Check if profile is incomplete
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [showMandatoryForm, setShowMandatoryForm] = useState(false);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      
      // Check if any of the required fields is empty
      const isIncomplete = !profile.first_name || !profile.last_name || !profile.phone || !profile.city;
      setIsProfileIncomplete(isIncomplete);
      
      // If any of the fields is missing, show the mandatory form
      if (isIncomplete) {
        setShowMandatoryForm(true);
      }
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
          const { vehicles } = await getUserVehicles();
          if (vehicles && vehicles.length > 0) {
            const activeVehicles: Auction[] = [];
            const draftVehicles: Auction[] = [];
            
            // Transform vehicles to Auction format
            vehicles.forEach((vehicle: Vehicle) => {
              const formattedVehicle: Auction = {
                id: vehicle.id,
                title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
                description: vehicle.description || '',
                imageUrl: vehicle.photo_url || '/placeholder.svg',
                currentBid: vehicle.auctions?.[0]?.start_price || 0,
                endTime: vehicle.auctions?.[0]?.end_date ? new Date(vehicle.auctions[0].end_date) : new Date(),
                bidCount: 0, // Default value
                status: vehicle.auctions?.[0]?.status || 'draft',
                auctionId: vehicle.auctions?.[0]?.id || null,
                vehicleId: vehicle.id
              };
              
              // Separate active auctions from drafts
              if (vehicle.auctions && vehicle.auctions.length > 0) {
                if (vehicle.auctions[0].status === 'draft') {
                  draftVehicles.push(formattedVehicle);
                } else {
                  activeVehicles.push(formattedVehicle);
                }
              } else {
                // If no auction is associated with the vehicle, it's a draft
                draftVehicles.push(formattedVehicle);
              }
            });
            
            setSellingAuctions(activeVehicles);
            setDraftAuctions(draftVehicles);
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
  
  const handleCloseMandatoryForm = () => {
    // Only allow closing if the form was submitted successfully
    // This is handled by the form component itself
  };

  const handleDeleteDraft = () => {
    // Refresh the vehicles list
    const loadUserVehicles = async () => {
      if (user) {
        setIsLoadingVehicles(true);
        try {
          // Load user vehicles
          const { vehicles } = await getUserVehicles();
          if (vehicles && vehicles.length > 0) {
            const activeVehicles: Auction[] = [];
            const draftVehicles: Auction[] = [];
            
            // Transform vehicles to Auction format
            vehicles.forEach((vehicle: Vehicle) => {
              const formattedVehicle: Auction = {
                id: vehicle.id,
                title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
                description: vehicle.description || '',
                imageUrl: vehicle.photo_url || '/placeholder.svg',
                currentBid: vehicle.auctions?.[0]?.start_price || 0,
                endTime: vehicle.auctions?.[0]?.end_date ? new Date(vehicle.auctions[0].end_date) : new Date(),
                bidCount: 0, // Default value
                status: vehicle.auctions?.[0]?.status || 'draft',
                auctionId: vehicle.auctions?.[0]?.id || null,
                vehicleId: vehicle.id
              };
              
              // Separate active auctions from drafts
              if (vehicle.auctions && vehicle.auctions.length > 0) {
                if (vehicle.auctions[0].status === 'draft') {
                  draftVehicles.push(formattedVehicle);
                } else {
                  activeVehicles.push(formattedVehicle);
                }
              } else {
                // If no auction is associated with the vehicle, it's a draft
                draftVehicles.push(formattedVehicle);
              }
            });
            
            setSellingAuctions(activeVehicles);
            setDraftAuctions(draftVehicles);
          } else {
            setSellingAuctions([]);
            setDraftAuctions([]);
          }
        } catch (error) {
          console.error("Error al cargar vehículos del usuario", error);
          toast.error("Error al cargar tus vehículos");
        } finally {
          setIsLoadingVehicles(false);
        }
      }
    };
    
    loadUserVehicles();
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
            <button onClick={() => navigate('/auth?redirect=/perfil')} className="bg-contrareloj hover:bg-contrareloj-dark text-white px-4 py-2 rounded">
              Iniciar sesión
            </button>
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
              <ProfileHeader
                firstName={profile.first_name || ''}
                lastName={profile.last_name || ''}
                createdAt={user.created_at || Date.now()}
                isEditing={isEditing}
                onEditClick={() => setIsEditing(true)}
                onSaveClick={handleSaveProfile}
                getInitials={getInitials}
              />
              
              <ProfileForm
                isEditing={isEditing}
                firstName={firstName}
                lastName={lastName}
                phone={phone}
                city={city}
                email={user.email || ''}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                biddingCount={biddingAuctions.length}
                sellingCount={sellingAuctions.length}
                draftsCount={draftAuctions.length}
                favoritesCount={favoriteAuctions.length}
                wonCount={wonAuctions.length}
                setFirstName={setFirstName}
                setLastName={setLastName}
                setPhone={setPhone}
                setCity={setCity}
                setNewPassword={setNewPassword}
                setConfirmPassword={setConfirmPassword}
              />
            </div>
          </div>
          
          {/* Sección de Reputación */}
          <ReputationSection
            subastas_ganadas={profile.subastas_ganadas || 0}
            subastas_abandonadas={profile.subastas_abandonadas || 0}
            penalizaciones={profile.penalizaciones || 0}
          />
          
          {/* Sección de Valoraciones */}
          <UserRatingsSection
            userId={profile.id}
            averageRating={profile.valoracion_promedio || 0}
          />
          
          <ProfileTabs
            biddingAuctions={biddingAuctions}
            favoriteAuctions={favoriteAuctions}
            sellingAuctions={sellingAuctions}
            draftAuctions={draftAuctions}
            wonAuctions={wonAuctions}
            isLoadingVehicles={isLoadingVehicles}
            isLoadingFavorites={isLoadingFavorites}
            onDeleteDraft={handleDeleteDraft}
          />
        </div>
        
        {/* Sección de verificación de identidad */}
        <IdentityVerificationSection
          isVerified={profile?.identity_verified}
          onVerifyClick={() => setShowVerifyDialog(true)}
        />
      </main>
      
      <Footer />
      
      {/* Diálogo de verificación de identidad */}
      <VerifyIdentityDialog 
        isOpen={showVerifyDialog} 
        onClose={() => setShowVerifyDialog(false)} 
      />
      
      {/* Mandatory Profile Form */}
      <MandatoryProfileForm
        isOpen={showMandatoryForm}
        onClose={handleCloseMandatoryForm}
        redirectAfter={searchParams.get('redirect') || '/perfil'}
      />
    </div>
  );
};

export default Profile;
