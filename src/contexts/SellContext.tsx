
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';
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
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
  };

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
  const handleDeletePhoto = (index: number) => {
    setUploadedPhotos(prev => {
      // No permitir eliminar la foto principal
      if (index === 0) return prev;
      
      // Filtrar la foto a eliminar
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

  const nextStep = () => {
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const value = {
    step, setStep,
    vehicleId, setVehicleId,
    auctionId, setAuctionId,
    isLoggedIn, setIsLoggedIn,
    isCheckingAuth, setIsCheckingAuth,
    isAuthDialogOpen, setIsAuthDialogOpen,
    isProcessing, setIsProcessing,
    userProfile, setUserProfile,
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
    handleAuctionInfoChange
  };

  return (
    <SellContext.Provider value={value}>
      {children}
    </SellContext.Provider>
  );
};
