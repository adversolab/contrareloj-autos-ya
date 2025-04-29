
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  getCurrentUser,
  signIn
} from '@/services/authService';
import { 
  saveVehicleBasicInfo, 
  updateVehicleBasicInfo,
  saveVehicleFeatures,
  uploadVehiclePhoto,
  saveAuctionInfo,
  activateAuction,
  VehicleBasicInfo,
  VehicleFeature,
  AuctionInfo,
} from '@/services/vehicleService';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const SellCar = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [auctionId, setAuctionId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
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
  
  const [auctionInfo, setAuctionInfo] = useState<AuctionInfo>({
    reservePrice: 0,
    startPrice: 0,
    durationDays: 7,
    minIncrement: 100000,
    services: []
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
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
        setUploadedPhotos(prev => 
          prev.map(photo => 
            photo.id === index 
              ? { ...photo, file, preview: reader.result as string } 
              : photo
          )
        );
      };
      
      reader.readAsDataURL(file);
    }
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
    setAuctionInfo(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? parseFloat(value) : value
    }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async () => {
    const { email, password } = loginForm;
    
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    
    const { user, error } = await signIn(email, password);
    
    if (user) {
      setIsLoggedIn(true);
      setIsAuthDialogOpen(false);
    }
  };

  const saveStep1 = async () => {
    if (!isLoggedIn) {
      setIsAuthDialogOpen(true);
      return;
    }

    // Validar campos obligatorios
    if (!carInfo.brand || !carInfo.model || !carInfo.year || !carInfo.kilometers || !carInfo.fuel || !carInfo.transmission) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsProcessing(true);

    try {
      if (vehicleId) {
        // Actualizar vehículo existente
        await updateVehicleBasicInfo(vehicleId, carInfo);
      } else {
        // Crear nuevo vehículo
        const { vehicle, error } = await saveVehicleBasicInfo(carInfo);
        if (vehicle && !error) {
          setVehicleId(vehicle.id);
        } else {
          throw new Error(error?.message || "Error al guardar la información");
        }
      }
      
      // Ir al siguiente paso
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

    setIsProcessing(true);

    try {
      // Subir fotos
      for (const photo of uploadedPhotos) {
        if (photo.file) {
          await uploadVehiclePhoto(vehicleId, {
            file: photo.file,
            isMain: photo.isMain,
            position: photo.id
          });
        }
      }

      // Guardar características
      const allFeatures: VehicleFeature[] = [];
      Object.entries(features).forEach(([category, selectedFeatures]) => {
        selectedFeatures.forEach(feature => {
          allFeatures.push({ category, feature });
        });
      });

      await saveVehicleFeatures(vehicleId, allFeatures);

      // Ir al siguiente paso
      nextStep();
    } catch (error) {
      toast.error("Ocurrió un error al guardar las fotos y características");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveStep3 = async () => {
    if (!vehicleId) {
      toast.error("No se ha creado el vehículo correctamente");
      return;
    }

    // Validar campos
    if (auctionInfo.reservePrice <= 0 || auctionInfo.startPrice <= 0) {
      toast.error("Por favor ingresa precios válidos");
      return;
    }

    setIsProcessing(true);

    try {
      const { auction, error } = await saveAuctionInfo(vehicleId, auctionInfo);
      
      if (auction && !error) {
        setAuctionId(auction.id);
        nextStep();
      } else {
        throw new Error(error?.message || "Error al guardar la información de la subasta");
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
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Activar la subasta
      await activateAuction(auctionId);
      
      toast.success("¡Felicidades! Tu vehículo ha sido publicado correctamente");
      // Redireccionar a la página del detalle de la subasta
      navigate(`/subasta/${auctionId}`);
    } catch (error) {
      toast.error("Ocurrió un error al procesar el pago");
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
  if (!isCheckingAuth && !isLoggedIn && !isAuthDialogOpen) {
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
                    onClick={() => setIsAuthDialogOpen(true)}
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
          loginForm={loginForm}
          onLoginChange={handleLoginChange}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-3">Vende tu Auto en Contrareloj</h1>
            <p className="text-gray-600">
              Sigue los pasos para publicar tu auto en nuestra plataforma de subastas
            </p>
          </div>
          
          {/* Steps indicator */}
          <div className="mb-10">
            <div className="flex justify-between">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      step === item ? 'bg-contrareloj text-white' :
                      step > item ? 'bg-green-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > item ? '✓' : item}
                  </div>
                  <span className={`text-sm mt-2 ${step === item ? 'font-medium' : 'text-gray-500'}`}>
                    {item === 1 ? 'Información básica' : 
                     item === 2 ? 'Fotos y detalles' :
                     item === 3 ? 'Condiciones de subasta' :
                     'Revisión y pago'}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-3">
              <div className="absolute h-1 w-full bg-gray-200 rounded"></div>
              <div 
                className={`absolute h-1 bg-contrareloj rounded`}
                style={{ width: `${(step - 1) * 33.33}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Información Básica del Vehículo</CardTitle>
                <CardDescription>
                  Completa los datos básicos de tu vehículo para empezar
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); saveStep1(); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Marca*</label>
                      <Select 
                        onValueChange={(value) => handleSelectChange('brand', value)}
                        value={carInfo.brand}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona marca" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="toyota">Toyota</SelectItem>
                          <SelectItem value="chevrolet">Chevrolet</SelectItem>
                          <SelectItem value="ford">Ford</SelectItem>
                          <SelectItem value="hyundai">Hyundai</SelectItem>
                          <SelectItem value="kia">Kia</SelectItem>
                          <SelectItem value="mazda">Mazda</SelectItem>
                          <SelectItem value="nissan">Nissan</SelectItem>
                          <SelectItem value="subaru">Subaru</SelectItem>
                          <SelectItem value="honda">Honda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Modelo*</label>
                      <input 
                        type="text"
                        name="model"
                        value={carInfo.model}
                        onChange={handleInputChange}
                        placeholder="Ej: Corolla XEI"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Año*</label>
                      <Select 
                        onValueChange={(value) => handleSelectChange('year', value)}
                        value={carInfo.year}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona año" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 30 }, (_, i) => 2025 - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Kilómetros*</label>
                      <input 
                        type="text"
                        name="kilometers"
                        value={carInfo.kilometers}
                        onChange={handleInputChange}
                        placeholder="Ej: 45000"
                        className="w-full border border-gray-300 rounded-md p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Combustible*</label>
                      <Select 
                        onValueChange={(value) => handleSelectChange('fuel', value)}
                        value={carInfo.fuel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona combustible" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasolina">Gasolina</SelectItem>
                          <SelectItem value="diesel">Diésel</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                          <SelectItem value="electrico">Eléctrico</SelectItem>
                          <SelectItem value="gnc">Gas Natural</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Transmisión*</label>
                      <Select 
                        onValueChange={(value) => handleSelectChange('transmission', value)}
                        value={carInfo.transmission}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona transmisión" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatica">Automática</SelectItem>
                          <SelectItem value="cvt">CVT</SelectItem>
                          <SelectItem value="semiautomatica">Semi-automática</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción general*</label>
                    <textarea 
                      name="description"
                      value={carInfo.description}
                      onChange={handleInputChange}
                      placeholder="Describe brevemente tu vehículo, menciona detalles importantes, estado general, etc."
                      className="w-full border border-gray-300 rounded-md p-2 h-32"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Guardando..." : "Continuar"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Photos and Details */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Fotos y Detalles</CardTitle>
                <CardDescription>
                  Agrega fotos de calidad y especifica las características de tu vehículo
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Sube fotos de tu vehículo</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Las fotos de buena calidad aumentan las posibilidades de venta. Sube al menos 5 fotos.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedPhotos.map((photo) => (
                        <div 
                          key={photo.id} 
                          className="border-2 border-dashed border-gray-300 rounded-lg aspect-video flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden"
                        >
                          {photo.preview ? (
                            <>
                              <img 
                                src={photo.preview} 
                                alt="Preview" 
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <label className="cursor-pointer bg-white text-black px-3 py-1 rounded-md text-sm">
                                  Cambiar
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, photo.id)}
                                  />
                                </label>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className="text-4xl text-gray-300 mb-2">+</span>
                              <span className="text-sm text-gray-500 mb-2">
                                {photo.id === 0 ? 'Foto principal*' : 
                                 photo.id === 1 ? 'Lateral' :
                                 photo.id === 2 ? 'Interior' : 
                                 photo.id === 3 ? 'Maletero' : 
                                 photo.id === 4 ? 'Motor' : 'Otra'}
                              </span>
                              <label className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm">
                                Seleccionar
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload(e, photo.id)}
                                />
                              </label>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium mb-4">Características y equipamiento</h3>
                    
                    <Tabs defaultValue="exterior">
                      <TabsList className="grid grid-cols-4 mb-6">
                        <TabsTrigger value="exterior">Exterior</TabsTrigger>
                        <TabsTrigger value="interior">Interior</TabsTrigger>
                        <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
                        <TabsTrigger value="confort">Confort</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="exterior" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['Llantas de aleación', 'Neblineros', 'Barras de techo', 'Spoiler', 'Sunroof', 'Sensores de estacionamiento', 'Cámara de retroceso', 'Espejos eléctricos', 'Faros LED'].map((item) => (
                            <label key={item} className="flex items-center">
                              <input 
                                type="checkbox" 
                                className="mr-2"
                                checked={features.exterior.includes(item)}
                                onChange={(e) => handleFeatureChange('exterior', item, e.target.checked)} 
                              />
                              <span className="text-sm">{item}</span>
                            </label>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="interior" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['Tapiz de cuero', 'Asientos eléctricos', 'Asientos con memoria', 'Volante multifunción', 'Control de crucero', 'Climatizador', 'Alzavidrios eléctricos', 'Pantalla táctil', 'Android Auto/Apple CarPlay'].map((item) => (
                            <label key={item} className="flex items-center">
                              <input 
                                type="checkbox" 
                                className="mr-2"
                                checked={features.interior.includes(item)}
                                onChange={(e) => handleFeatureChange('interior', item, e.target.checked)} 
                              />
                              <span className="text-sm">{item}</span>
                            </label>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="seguridad" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['Airbags frontales', 'Airbags laterales', 'Airbags de cortina', 'Frenos ABS', 'Control de estabilidad', 'Control de tracción', 'Asistente de frenado', 'Sensor de punto ciego', 'Alerta de colisión'].map((item) => (
                            <label key={item} className="flex items-center">
                              <input 
                                type="checkbox" 
                                className="mr-2"
                                checked={features.seguridad.includes(item)}
                                onChange={(e) => handleFeatureChange('seguridad', item, e.target.checked)} 
                              />
                              <span className="text-sm">{item}</span>
                            </label>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="confort" className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {['Bluetooth', 'Sistema de sonido premium', 'Cargador inalámbrico', 'Puertos USB', 'Encendido sin llave', 'Acceso sin llave', 'Arranque por botón', 'Asientos calefaccionados', 'Volante calefaccionado'].map((item) => (
                            <label key={item} className="flex items-center">
                              <input 
                                type="checkbox" 
                                className="mr-2"
                                checked={features.confort.includes(item)}
                                onChange={(e) => handleFeatureChange('confort', item, e.target.checked)} 
                              />
                              <span className="text-sm">{item}</span>
                            </label>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium mb-4">Detalles adicionales</h3>
                    <textarea 
                      placeholder="Agrega información relevante sobre el historial del vehículo, mantenciones, documentos, etc."
                      className="w-full border border-gray-300 rounded-md p-2 h-32"
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={prevStep}
                      disabled={isProcessing}
                    >
                      Atrás
                    </Button>
                    <Button 
                      className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                      onClick={saveStep2}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Guardando..." : "Continuar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Auction Conditions */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Condiciones de la Subasta</CardTitle>
                <CardDescription>
                  Define cómo quieres que sea la subasta de tu vehículo
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Precio de reserva*</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input 
                          type="text"
                          placeholder="Precio mínimo que aceptarás"
                          className="w-full border border-gray-300 rounded-md p-2 pl-7"
                          value={auctionInfo.reservePrice > 0 ? auctionInfo.reservePrice.toString() : ''}
                          onChange={(e) => handleAuctionInfoChange('reservePrice', e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Este precio no será visible para los compradores
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Precio de inicio*</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input 
                          type="text"
                          placeholder="Precio de apertura de la subasta"
                          className="w-full border border-gray-300 rounded-md p-2 pl-7"
                          value={auctionInfo.startPrice > 0 ? auctionInfo.startPrice.toString() : ''}
                          onChange={(e) => handleAuctionInfoChange('startPrice', e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Sugerimos un precio atractivo para generar interés
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Duración de la subasta*</label>
                      <Select
                        value={auctionInfo.durationDays.toString()}
                        onValueChange={(value) => handleAuctionInfoChange('durationDays', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona duración" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 días</SelectItem>
                          <SelectItem value="5">5 días</SelectItem>
                          <SelectItem value="7">7 días</SelectItem>
                          <SelectItem value="10">10 días</SelectItem>
                          <SelectItem value="14">14 días</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Incremento mínimo*</label>
                      <Select
                        value={auctionInfo.minIncrement.toString()}
                        onValueChange={(value) => handleAuctionInfoChange('minIncrement', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona incremento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50000">$50.000</SelectItem>
                          <SelectItem value="100000">$100.000</SelectItem>
                          <SelectItem value="200000">$200.000</SelectItem>
                          <SelectItem value="500000">$500.000</SelectItem>
                          <SelectItem value="1000000">$1.000.000</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Monto mínimo para cada nueva oferta
                      </p>
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-lg bg-gray-50">
                    <h4 className="font-medium mb-3">Servicios adicionales</h4>
                    
                    <div className="space-y-4">
                      <label className="flex items-start">
                        <input 
                          type="checkbox" 
                          className="mt-1 mr-3"
                          checked={auctionInfo.services.includes('verification')}
                          onChange={(e) => handleServiceChange('verification', e.target.checked)}
                        />
                        <div>
                          <span className="font-medium">Verificación mecánica</span>
                          <p className="text-sm text-gray-500">
                            Un mecánico certificado realizará una inspección completa de tu vehículo para generar más confianza en los compradores. Costo: $80.000
                          </p>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input 
                          type="checkbox" 
                          className="mt-1 mr-3"
                          checked={auctionInfo.services.includes('photography')}
                          onChange={(e) => handleServiceChange('photography', e.target.checked)}
                        />
                        <div>
                          <span className="font-medium">Servicio de fotografía profesional</span>
                          <p className="text-sm text-gray-500">
                            Un fotógrafo profesional tomará fotos de alta calidad de tu vehículo. Costo: $50.000
                          </p>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input 
                          type="checkbox" 
                          className="mt-1 mr-3"
                          checked={auctionInfo.services.includes('highlight')}
                          onChange={(e) => handleServiceChange('highlight', e.target.checked)}
                        />
                        <div>
                          <span className="font-medium">Destacar anuncio</span>
                          <p className="text-sm text-gray-500">
                            Tu anuncio aparecerá en las primeras posiciones y en la página principal. Costo: $30.000
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={prevStep}
                      disabled={isProcessing}
                    >
                      Atrás
                    </Button>
                    <Button 
                      className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                      onClick={saveStep3}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Guardando..." : "Continuar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 4: Review and Payment */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Revisión y Pago</CardTitle>
                <CardDescription>
                  Revisa la información y completa el pago para publicar tu anuncio
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                      <h3 className="font-semibold">Resumen de tu subasta</h3>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">Vehículo</h4>
                          <p className="font-medium">
                            {carInfo.brand ? carInfo.brand.charAt(0).toUpperCase() + carInfo.brand.slice(1) : ''} {carInfo.model} {carInfo.year}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">Precio de inicio</h4>
                          <p className="font-medium">${auctionInfo.startPrice.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">Duración</h4>
                          <p className="font-medium">{auctionInfo.durationDays} días</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm text-gray-500 mb-1">Incremento mínimo</h4>
                          <p className="font-medium">${auctionInfo.minIncrement.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setStep(1)}
                        >
                          Editar información
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                      <h3 className="font-semibold">Detalle de costos</h3>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tarifa básica de publicación</span>
                          <span>$25.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verificación mecánica</span>
                          <span>{auctionInfo.services.includes('verification') ? '$80.000' : '$0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Servicio de fotografía</span>
                          <span>{auctionInfo.services.includes('photography') ? '$50.000' : '$0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Destacar anuncio</span>
                          <span>{auctionInfo.services.includes('highlight') ? '$30.000' : '$0'}</span>
                        </div>
                        
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${(25000 + 
                              (auctionInfo.services.includes('verification') ? 80000 : 0) + 
                              (auctionInfo.services.includes('photography') ? 50000 : 0) + 
                              (auctionInfo.services.includes('highlight') ? 30000 : 0)
                            ).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Cobraremos una comisión del 5% sobre el valor final de venta solo si se concreta la transacción.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b">
                      <h3 className="font-semibold">Método de pago</h3>
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-4">
                        <div className="flex gap-4 mb-4">
                          <label className="flex items-center">
                            <input type="radio" name="payment" className="mr-2" defaultChecked />
                            <span>Tarjeta de crédito/débito</span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="payment" className="mr-2" />
                            <span>Transferencia</span>
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Número de tarjeta</label>
                            <input 
                              type="text"
                              placeholder="0000 0000 0000 0000"
                              className="w-full border border-gray-300 rounded-md p-2"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Fecha expiración</label>
                              <input 
                                type="text"
                                placeholder="MM/AA"
                                className="w-full border border-gray-300 rounded-md p-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">CVC</label>
                              <input 
                                type="text"
                                placeholder="123"
                                className="w-full border border-gray-300 rounded-md p-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <input type="checkbox" className="mt-1 mr-3" />
                    <p className="text-sm">
                      Acepto los <a href="/terminos" className="text-contrareloj hover:underline">Términos y Condiciones</a> y confirmo que la información proporcionada es correcta.
                    </p>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={prevStep}
                      disabled={isProcessing}
                    >
                      Atrás
                    </Button>
                    <Button 
                      className="bg-contrareloj hover:bg-contrareloj-dark text-white"
                      onClick={finishProcess}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Procesando..." : "Pagar y publicar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onOpenChange={setIsAuthDialogOpen}
        loginForm={loginForm}
        onLoginChange={handleLoginChange}
        onLogin={handleLogin}
      />
    </div>
  );
};

// Componente de diálogo de autenticación
const AuthDialog = ({ 
  isOpen, 
  onOpenChange, 
  loginForm, 
  onLoginChange, 
  onLogin 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  loginForm: { email: string; password: string };
  onLoginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogin: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Iniciar sesión</DialogTitle>
          <DialogDescription>
            Por favor inicia sesión para publicar tu vehículo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={loginForm.email}
              onChange={onLoginChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña</label>
            <Input
              name="password"
              type="password"
              placeholder="********"
              value={loginForm.password}
              onChange={onLoginChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onLogin} className="bg-contrareloj hover:bg-contrareloj-dark text-white">
            Iniciar sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellCar;
