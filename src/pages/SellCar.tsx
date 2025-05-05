import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { 
  saveVehicleBasicInfo, 
  updateVehicleBasicInfo,
  saveVehicleFeatures,
  uploadVehiclePhoto,
  uploadAutofactReport,
  saveAuctionInfo,
  activateAuction,
  VehicleBasicInfo,
  VehicleFeature,
  AuctionInfo,
} from '@/services/vehicleService';

// Components
import StepIndicator from '@/components/sell/StepIndicator';
import BasicInfoForm from '@/components/sell/BasicInfoForm';
import PhotosAndDetailsForm from '@/components/sell/PhotosAndDetailsForm';
import AuctionConditionsForm from '@/components/sell/AuctionConditionsForm';
import ReviewAndPaymentForm from '@/components/sell/ReviewAndPaymentForm';
import AuthDialog from '@/components/sell/AuthDialog';

const SellCar = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState<{first_name: string | null, last_name: string | null, phone: string | null} | null>(null);
  
  const [carInfo, setCarInfo] = useState<VehicleBasicInfo>({
    brand: '',
    model: '',
    year: '',
    kilometers: '',
    fuel: '',
    transmission: '',
    description: '',
  });
  
  const [features, setFeatures] = useState<{[key: string]: string[]}>({
    exterior: [],
    interior: [],
    seguridad: [],
    confort: []
  });

  const [uploadedPhotos, setUploadedPhotos] = useState<{id: number, file: File | null, preview: string | null, isMain: boolean}[]>(
    Array.from({ length: 6 }, (_, i) => ({ 
      id: i, 
      file: null, 
      preview: null,
      isMain: i === 0
    }))
  );

  const [additionalDetails, setAdditionalDetails] = useState('');
  const [autofactReport, setAutofactReport] = useState<File | null>(null);
  
  const [auctionInfo, setAuctionInfo] = useState<AuctionInfo>({
    reservePrice: 0,
    startPrice: 0,
    durationDays: 7,
    minIncrement: 100000,
    services: []
  });

  // Verificar autenticación y perfil del usuario al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
      
      if (user) {
        // Obtener información del perfil
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', user.id)
          .single();
          
        setUserProfile(data);
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Manejar subida de imágenes
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setUploadedPhotos(prev => {
          // Si el índice es mayor que la longitud actual, agregamos un nuevo elemento
          if (index >= prev.length) {
            return [
              ...prev,
              { id: prev.length, file, preview: reader.result as string, isMain: prev.length === 0 }
            ];
          } else {
            // Si no, actualizamos el elemento existente
            return prev.map(photo => 
              photo.id === index 
                ? { ...photo, file, preview: reader.result as string } 
                : photo
            );
          }
        });
      };
      
      reader.readAsDataURL(file);
    } else if (!e.target.files && index >= uploadedPhotos.length) {
      // Agregar un nuevo espacio para foto
      setUploadedPhotos(prev => [
        ...prev, 
        { 
          id: prev.length, 
          file: null, 
          preview: null, 
          isMain: prev.length === 0 
        }
      ]);
    }
  }, [uploadedPhotos.length]);

  // Manejar subida de informe Autofact
  const handleAutofactReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('El archivo debe ser un PDF');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        toast.error('El archivo es demasiado grande. El tamaño máximo es de 10MB');
        return;
      }
      
      setAutofactReport(file);
    }
  };

  // Manejar eliminación de fotos
  const handleDeletePhoto = useCallback((index: number) => {
    setUploadedPhotos(prev => {
      // No permitir eliminar la foto principal
      if (index === 0) return prev;
      
      // Filtrar la foto a eliminar
      return prev.filter(photo => photo.id !== index).map((photo, i) => ({
        ...photo,
        id: i
      }));
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCarInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCarInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureChange = (category: string, feature: string, checked: boolean) => {
    setFeatures(prev => {
      if (checked) {
        return {
          ...prev,
          [category]: [...prev[category], feature]
        };
      } else {
        return {
          ...prev,
          [category]: prev[category].filter(f => f !== feature)
        };
      }
    });
  };

  const handleAdditionalDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAdditionalDetails(e.target.value);
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    setAuctionInfo(prev => {
      if (checked) {
        return {
          ...prev,
          services: [...prev.services, service]
        };
      } else {
        return {
          ...prev,
          services: prev.services.filter(s => s !== service)
        };
      }
    });
  };

  const handleAuctionInfoChange = (name: string, value: string | number) => {
    // Asegurar que la duración mínima es de 7 días
    if (name === 'durationDays' && typeof value === 'number' && value < 7) {
      value = 7;
      toast.info("La duración mínima de la subasta es de 7 días");
    } else if (name === 'durationDays' && typeof value === 'string' && parseInt(value) < 7) {
      value = '7';
      toast.info("La duración mínima de la subasta es de 7 días");
    }
    
    setAuctionInfo(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? parseFloat(value) : value
    }));
  };

  // Verificar que el usuario tiene perfil completo
  const checkProfileComplete = () => {
    if (!userProfile?.first_name || !userProfile?.last_name || !userProfile?.phone) {
      toast.error("Debes completar tu perfil antes de continuar");
      navigate('/perfil?redirect=/vender');
      return false;
    }
    return true;
  };

  const saveStep1 = async () => {
    if (!isLoggedIn) {
      setIsAuthDialogOpen(true);
      return;
    }
    
    // Verificar perfil completo
    if (!checkProfileComplete()) {
      return;
    }

    // Validate required fields
    if (!carInfo.brand || !carInfo.model || !carInfo.year || !carInfo.kilometers || !carInfo.fuel || !carInfo.transmission) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsProcessing(true);

    try {
      if (vehicleId) {
        // Update existing vehicle
        const result = await updateVehicleBasicInfo(vehicleId, carInfo);
        if (!result.success) {
          throw new Error("Error updating vehicle info");
        }
      } else {
        // Create new vehicle
        const result = await saveVehicleBasicInfo(carInfo);
        if (result.success && result.vehicleId) {
          setVehicleId(result.vehicleId);
        } else {
          throw new Error("Error saving vehicle info");
        }
      }
      
      // Go to next step
      nextStep();
    } catch (error) {
      toast.error("Ocurrió un error al guardar la información");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveStep2 = async () => {
    if (!vehicleId) {
      toast.error("No se ha creado el vehículo correctamente");
      return;
    }

    // Check for at least one photo
    const hasPhotos = uploadedPhotos.some(photo => photo.file !== null);
    if (!hasPhotos) {
      toast.error("Debes subir al menos una foto principal");
      return;
    }
    
    // Verificar que se subió el informe Autofact
    if (!autofactReport) {
      toast.error("Debes subir el informe Autofact (PDF)");
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Starting photo uploads for vehicle:", vehicleId);
      
      // First, collect all files with their positions
      const photosToUpload = uploadedPhotos
        .filter(photo => photo.file !== null)
        .map((photo) => ({
          file: photo.file!,
          isMain: photo.isMain,
          position: photo.id
        }));
        
      console.log(`Found ${photosToUpload.length} photos to upload`);
      
      // Upload all photos at once for better performance
      if (photosToUpload.length > 0) {
        const result = await uploadVehiclePhotos(vehicleId, photosToUpload.map(p => p.file));
        
        if (result.error) {
          throw new Error(`Error uploading photos: ${result.error}`);
        }
        
        console.log("Successfully uploaded photos:", result.photos);
      }
      
      // Upload Autofact report
      if (autofactReport) {
        console.log("Uploading Autofact report");
        const reportResult = await uploadAutofactReport(vehicleId, autofactReport);
        
        if (!reportResult.success) {
          throw new Error(`Error uploading Autofact report: ${reportResult.error}`);
        }
        
        console.log("Successfully uploaded report:", reportResult.url);
      }

      // Save features
      const allFeatures: VehicleFeature[] = [];
      Object.entries(features).forEach(([category, selectedFeatures]) => {
        selectedFeatures.forEach(feature => {
          allFeatures.push({ category, feature });
        });
      });

      console.log("Saving vehicle features:", allFeatures.length, "features");
      await saveVehicleFeatures(vehicleId, allFeatures);

      // Go to next step
      toast.success("Fotos y detalles guardados exitosamente");
      nextStep();
    } catch (error: any) {
      console.error("Error in saveStep2:", error);
      toast.error("Ocurrió un error al guardar las fotos y características: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveStep3 = async () => {
    if (!vehicleId) {
      toast.error("No se ha creado el vehículo correctamente");
      return;
    }

    // Validate fields
    if (auctionInfo.reservePrice <= 0 || auctionInfo.startPrice <= 0) {
      toast.error("Por favor ingresa precios válidos");
      return;
    }

    // Check minimum duration
    if (auctionInfo.durationDays < 7) {
      setAuctionInfo(prev => ({ ...prev, durationDays: 7 }));
      toast.info("La duración mínima de la subasta es de 7 días");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await saveAuctionInfo(vehicleId, auctionInfo);
      
      if (result.success && result.auctionId) {
        setAuctionId(result.auctionId);
        nextStep();
      } else {
        throw new Error("Error al guardar la información de la subasta");
      }
    } catch (error) {
      toast.error("Ocurrió un error al guardar la información de la subasta");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const finishProcess = async () => {
    if (!auctionId) {
      toast.error("No se ha creado la subasta correctamente");
      return;
    }

    setIsProcessing(true);

    try {
      // Activar la subasta (quedará en draft hasta aprobación por admin)
      const result = await activateAuction(auctionId);
      
      if (result.success) {
        toast.success("¡Tu vehículo ha sido enviado para aprobación! Un administrador revisará la información pronto.");
        
        // Wait a second before redirecting to show the message
        setTimeout(() => {
          // Redirect to the profile page to see draft auctions
          navigate(`/perfil`);
        }, 2000);
      } else {
        toast.error("Ocurrió un error al finalizar el proceso");
      }
    } catch (error) {
      toast.error("Ocurrió un error al procesar la solicitud");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Redirigir a inicio de sesión si no está logueado
  if (!isCheckingAuth && !isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Iniciar sesión requerido</CardTitle>
              <CardDescription>
                Debes iniciar sesión para publicar un vehículo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Por favor inicia sesión para continuar con la publicación de tu vehículo.</p>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => navigate('/auth?redirect=/vender')}
                    className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                  >
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
        <AuthDialog 
          isOpen={isAuthDialogOpen} 
          onOpenChange={setIsAuthDialogOpen}
          redirectUrl="/vender"
        />
      </div>
    );
  }
  
  // Mostrar mensaje de completar perfil si está logueado pero no tiene perfil completo
  if (!isCheckingAuth && isLoggedIn && userProfile && 
      (!userProfile.first_name || !userProfile.last_name || !userProfile.phone)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Completa tu perfil</CardTitle>
              <CardDescription>
                Debes completar tu perfil para publicar un vehículo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Para publicar un vehículo, es necesario que completes tu información de perfil:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {!userProfile.first_name && <li>Nombre</li>}
                  {!userProfile.last_name && <li>Apellido</li>}
                  {!userProfile.phone && <li>Teléfono</li>}
                </ul>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => navigate('/perfil?redirect=/vender')}
                    className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                  >
                    Completar perfil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const stepLabels = [
    'Información básica',
    'Fotos y detalles',
    'Condiciones de subasta',
    'Revisión y pago'
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Steps indicator */}
          <StepIndicator currentStep={step} steps={stepLabels} />
          
          {/* Step Forms */}
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && 'Información Básica del Vehículo'}
                {step === 2 && 'Fotos y Detalles'}
                {step === 3 && 'Condiciones de la Subasta'}
                {step === 4 && 'Revisión y Pago'}
              </CardTitle>
              <CardDescription>
                {step === 1 && 'Completa los datos básicos de tu vehículo para empezar'}
                {step === 2 && 'Agrega fotos de calidad y especifica las características de tu vehículo'}
                {step === 3 && 'Define cómo quieres que sea la subasta de tu vehículo'}
                {step === 4 && 'Revisa la información y completa el pago para publicar tu anuncio'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {step === 1 && (
                <BasicInfoForm 
                  carInfo={carInfo}
                  onInputChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                  onSubmit={saveStep1}
                  isProcessing={isProcessing}
                />
              )}
              
              {step === 2 && (
                <PhotosAndDetailsForm
                  uploadedPhotos={uploadedPhotos}
                  features={features}
                  additionalDetails={additionalDetails}
                  autofactReport={autofactReport}
                  onImageUpload={handleImageUpload}
                  onFeatureChange={handleFeatureChange}
                  onAdditionalDetailsChange={handleAdditionalDetailsChange}
                  onAutofactReportChange={handleAutofactReportChange}
                  onDeletePhoto={handleDeletePhoto}
                  onPrevStep={prevStep}
                  onSubmit={saveStep2}
                  isProcessing={isProcessing}
                />
              )}
              
              {step === 3 && (
                <AuctionConditionsForm
                  auctionInfo={auctionInfo}
                  onAuctionInfoChange={handleAuctionInfoChange}
                  onServiceChange={handleServiceChange}
                  onPrevStep={prevStep}
                  onSubmit={saveStep3}
                  isProcessing={isProcessing}
                />
              )}
              
              {step === 4 && (
                <ReviewAndPaymentForm
                  carInfo={carInfo}
                  auctionInfo={auctionInfo}
                  onPrevStep={prevStep}
                  onEditInfo={() => setStep(1)}
                  onSubmit={finishProcess}
                  isProcessing={isProcessing}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onOpenChange={setIsAuthDialogOpen}
        redirectUrl="/vender"
      />
    </div>
  );
};

export default SellCar;
