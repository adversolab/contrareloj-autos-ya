
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
import { getUserCredits } from '@/services/creditService';
import { getPublicationServices, PublicationService } from '@/services/publicationService';
import { 
  VehicleBasicInfo, 
  VehicleFeature,
  AuctionInfo
} from '@/services/vehicleService';

type PhotoPreview = {
  id: number;
  file: File | null;
  preview: string | null;
  isMain: boolean;
};

type SellContextType = {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  vehicleId: string | null;
  setVehicleId: React.Dispatch<React.SetStateAction<string | null>>;
  auctionId: string | null;
  setAuctionId: React.Dispatch<React.SetStateAction<string | null>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isCheckingAuth: boolean;
  setIsCheckingAuth: React.Dispatch<React.SetStateAction<boolean>>;
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  userProfile: {first_name: string | null, last_name: string | null, phone: string | null} | null;
  setUserProfile: React.Dispatch<React.SetStateAction<{first_name: string | null, last_name: string | null, phone: string | null} | null>>;
  userCredits: number;
  setUserCredits: React.Dispatch<React.SetStateAction<number>>;
  publicationServices: PublicationService[];
  setPublicationServices: React.Dispatch<React.SetStateAction<PublicationService[]>>;
  carInfo: VehicleBasicInfo;
  setCarInfo: React.Dispatch<React.SetStateAction<VehicleBasicInfo>>;
  features: {[key: string]: string[]};
  setFeatures: React.Dispatch<React.SetStateAction<{[key: string]: string[]}>>;
  uploadedPhotos: PhotoPreview[];
  setUploadedPhotos: React.Dispatch<React.SetStateAction<PhotoPreview[]>>;
  additionalDetails: string;
  setAdditionalDetails: React.Dispatch<React.SetStateAction<string>>;
  autofactReport: File | null;
  setAutofactReport: React.Dispatch<React.SetStateAction<File | null>>;
  auctionInfo: AuctionInfo;
  setAuctionInfo: React.Dispatch<React.SetStateAction<AuctionInfo>>;
  nextStep: () => void;
  prevStep: () => void;
  checkProfileComplete: () => boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleFeatureChange: (category: string, feature: string, checked: boolean) => void;
  handleAdditionalDetailsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  handleAutofactReportChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeletePhoto: (index: number) => void;
  handleServiceChange: (service: string, checked: boolean) => void;
  handleAuctionInfoChange: (name: string, value: string | number) => void;
  refreshCredits: () => Promise<void>;
  getTotalCostInCredits: () => number;
  loadDraftData: (draftId: string) => Promise<void>;
  saveDraftAutomatically: () => Promise<void>;
};

export const SellContext = createContext<SellContextType | undefined>(undefined);

export const useSellContext = () => {
  const context = useContext(SellContext);
  if (!context) {
    throw new Error('useSellContext must be used within a SellProvider');
  }
  return context;
};

export const SellProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userProfile, setUserProfile] = useState<{first_name: string | null, last_name: string | null, phone: string | null} | null>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [publicationServices, setPublicationServices] = useState<PublicationService[]>([]);
  
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

  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoPreview[]>(
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

  // Load user data, credits, and publication services on mount
  useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
      
      if (user) {
        // Load user profile
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone')
          .eq('id', user.id)
          .single();
          
        setUserProfile(data);
        
        // Load user credits
        await refreshCredits();
      }
      
      // Load publication services
      const { services } = await getPublicationServices();
      setPublicationServices(services);
      
      setIsCheckingAuth(false);
    };

    loadUserData();
  }, []);

  const refreshCredits = async () => {
    const { credits } = await getUserCredits();
    setUserCredits(credits);
  };

  const getTotalCostInCredits = () => {
    let total = 0;
    
    // Base publication cost
    const baseService = publicationServices.find(s => s.servicio === 'publicacion_basica');
    if (baseService) total += baseService.costo_creditos;
    
    // Additional services
    auctionInfo.services.forEach(service => {
      let serviceName = '';
      switch (service) {
        case 'verification':
          serviceName = 'verificacion_mecanica';
          break;
        case 'photography':
          serviceName = 'fotografia_profesional';
          break;
        case 'highlight':
          serviceName = 'destacar_anuncio';
          break;
      }
      
      const serviceData = publicationServices.find(s => s.servicio === serviceName);
      if (serviceData) total += serviceData.costo_creditos;
    });
    
    return total;
  };

  // Save draft automatically
  const saveDraftAutomatically = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Only save if we have at least basic car info
      if (!carInfo.brand && !carInfo.model) return;

      console.log('Saving draft automatically...');

      if (vehicleId) {
        // Update existing vehicle
        const { error: updateError } = await supabase
          .from('vehicles')
          .update({
            brand: carInfo.brand,
            model: carInfo.model,
            year: carInfo.year ? parseInt(carInfo.year) : null,
            kilometers: carInfo.kilometers ? parseInt(carInfo.kilometers.replace(/\D/g, '')) : null,
            fuel: carInfo.fuel,
            transmission: carInfo.transmission,
            description: carInfo.description || additionalDetails,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicleId);

        if (updateError) {
          console.error('Error updating vehicle draft:', updateError);
          return;
        }
      } else {
        // Create new vehicle draft
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .insert({
            user_id: user.id,
            brand: carInfo.brand,
            model: carInfo.model,
            year: carInfo.year ? parseInt(carInfo.year) : null,
            kilometers: carInfo.kilometers ? parseInt(carInfo.kilometers.replace(/\D/g, '')) : null,
            fuel: carInfo.fuel,
            transmission: carInfo.transmission,
            description: carInfo.description || additionalDetails,
            is_approved: false
          })
          .select()
          .single();

        if (vehicleError || !vehicleData) {
          console.error('Error creating vehicle draft:', vehicleError);
          return;
        }

        setVehicleId(vehicleData.id);
      }

      // Save auction info if exists
      if (vehicleId && (auctionInfo.reservePrice > 0 || auctionInfo.startPrice > 0)) {
        if (auctionId) {
          // Update existing auction
          await supabase
            .from('auctions')
            .update({
              reserve_price: auctionInfo.reservePrice,
              start_price: auctionInfo.startPrice,
              duration_days: auctionInfo.durationDays,
              min_increment: auctionInfo.minIncrement,
              status: 'draft',
              updated_at: new Date().toISOString()
            })
            .eq('id', auctionId);
        } else {
          // Create new auction
          const { data: auctionData } = await supabase
            .from('auctions')
            .insert({
              vehicle_id: vehicleId,
              reserve_price: auctionInfo.reservePrice,
              start_price: auctionInfo.startPrice,
              duration_days: auctionInfo.durationDays,
              min_increment: auctionInfo.minIncrement,
              status: 'draft'
            })
            .select()
            .single();

          if (auctionData) {
            setAuctionId(auctionData.id);
          }
        }
      }

      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [carInfo, additionalDetails, auctionInfo, vehicleId, auctionId, isLoggedIn]);

  // Auto-save when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraftAutomatically();
    }, 2000); // Save 2 seconds after user stops typing

    return () => clearTimeout(timeoutId);
  }, [saveDraftAutomatically]);

  // Manejar subida de imágenes
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setUploadedPhotos(prev => {
          if (index >= prev.length) {
            return [
              ...prev,
              { id: prev.length, file, preview: reader.result as string, isMain: prev.length === 0 }
            ];
          } else {
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
  };

  // Manejar subida de informe Autofact
  const handleAutofactReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('El archivo debe ser un PDF');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. El tamaño máximo es de 10MB');
        return;
      }
      
      setAutofactReport(file);
    }
  };

  // Manejar eliminación de fotos
  const handleDeletePhoto = (index: number) => {
    setUploadedPhotos(prev => {
      if (index === 0) return prev;
      
      return prev.filter(photo => photo.id !== index).map((photo, i) => ({
        ...photo,
        id: i
      }));
    });
  };

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

  const nextStep = () => {
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const loadDraftData = useCallback(async (draftId: string) => {
    try {
      console.log('Loading draft data for vehicle ID:', draftId);
      
      // Load vehicle basic info
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', draftId)
        .single();

      if (vehicleError) {
        console.error('Error loading vehicle data:', vehicleError);
        toast.error('Error al cargar el borrador');
        return;
      }

      if (vehicleData) {
        setVehicleId(draftId);
        setCarInfo({
          brand: vehicleData.brand || '',
          model: vehicleData.model || '',
          year: vehicleData.year?.toString() || '',
          kilometers: vehicleData.kilometers?.toString() || '',
          fuel: vehicleData.fuel || '',
          transmission: vehicleData.transmission || '',
          description: vehicleData.description || ''
        });
        setAdditionalDetails(vehicleData.description || '');
      }

      // Load vehicle features
      const { data: featuresData, error: featuresError } = await supabase
        .from('vehicle_features')
        .select('category, feature')
        .eq('vehicle_id', draftId);

      if (!featuresError && featuresData) {
        const loadedFeatures: {[key: string]: string[]} = {
          exterior: [],
          interior: [],
          seguridad: [],
          confort: []
        };
        
        featuresData.forEach(item => {
          if (loadedFeatures[item.category]) {
            loadedFeatures[item.category].push(item.feature);
          }
        });
        
        setFeatures(loadedFeatures);
      }

      // Load vehicle photos
      const { data: photosData, error: photosError } = await supabase
        .from('vehicle_photos')
        .select('url, position, is_primary')
        .eq('vehicle_id', draftId)
        .order('position');

      if (!photosError && photosData && photosData.length > 0) {
        const loadedPhotos = Array.from({ length: 6 }, (_, i) => ({ 
          id: i, 
          file: null, 
          preview: null,
          isMain: i === 0
        }));

        photosData.forEach((photo, index) => {
          if (index < 6) {
            loadedPhotos[index] = {
              id: index,
              file: null,
              preview: photo.url,
              isMain: photo.is_primary || index === 0
            };
          }
        });

        setUploadedPhotos(loadedPhotos);
      }

      // Load auction info if exists
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('vehicle_id', draftId)
        .single();

      if (!auctionError && auctionData) {
        setAuctionId(auctionData.id);
        setAuctionInfo({
          reservePrice: Number(auctionData.reserve_price) || 0,
          startPrice: Number(auctionData.start_price) || 0,
          durationDays: auctionData.duration_days || 7,
          minIncrement: Number(auctionData.min_increment) || 100000,
          services: [] // We'll load services separately if needed
        });
      }

      toast.success('Borrador cargado exitosamente');
    } catch (error) {
      console.error('Error loading draft:', error);
      toast.error('Error al cargar el borrador');
    }
  }, []);

  const value = {
    step, setStep,
    vehicleId, setVehicleId,
    auctionId, setAuctionId,
    isLoggedIn, setIsLoggedIn,
    isCheckingAuth, setIsCheckingAuth,
    isAuthDialogOpen, setIsAuthDialogOpen,
    isProcessing, setIsProcessing,
    userProfile, setUserProfile,
    userCredits, setUserCredits,
    publicationServices, setPublicationServices,
    carInfo, setCarInfo,
    features, setFeatures,
    uploadedPhotos, setUploadedPhotos,
    additionalDetails, setAdditionalDetails,
    autofactReport, setAutofactReport,
    auctionInfo, setAuctionInfo,
    nextStep, prevStep,
    checkProfileComplete,
    handleInputChange,
    handleSelectChange,
    handleFeatureChange,
    handleAdditionalDetailsChange,
    handleImageUpload,
    handleAutofactReportChange,
    handleDeletePhoto,
    handleServiceChange,
    handleAuctionInfoChange,
    refreshCredits,
    getTotalCostInCredits,
    loadDraftData,
    saveDraftAutomatically
  };

  return (
    <SellContext.Provider value={value}>
      {children}
    </SellContext.Provider>
  );
};
