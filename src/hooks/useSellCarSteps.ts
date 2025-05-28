
import { useState } from 'react';
import { toast } from 'sonner';
import { useSellContext } from '@/contexts/SellContext';
import { 
  saveVehicleBasicInfo, 
  updateVehicleBasicInfo,
  saveVehicleFeatures,
  uploadVehiclePhotos,
  uploadAutofactReport,
  saveAuctionInfo,
  activateAuction
} from '@/services/vehicleService';
import { VehicleFeature } from '@/services/vehicles/types';
import { processCreditsMovement } from '@/services/creditService';

export const useSellCarSteps = () => {
  const {
    vehicleId, setVehicleId,
    auctionId, setAuctionId,
    carInfo,
    isLoggedIn, setIsAuthDialogOpen,
    features,
    uploadedPhotos,
    autofactReport,
    auctionInfo,
    checkProfileComplete,
    nextStep,
    setIsProcessing,
    getTotalCostInCredits,
    publicationServices
  } = useSellContext();
  
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

    // Validate kilometers separately
    const kilometersValue = carInfo.kilometers ? carInfo.kilometers.toString().replace(/\\D/g, '') : '';
    if (!kilometersValue || isNaN(parseInt(kilometersValue)) || parseInt(kilometersValue) <= 0) {
      toast.error("El valor de kilómetros debe ser un número mayor que 0");
      return;
    }

    setIsProcessing(true);

    try {
      if (vehicleId) {
        // Update existing vehicle
        const result = await updateVehicleBasicInfo(vehicleId, carInfo);
        if (!result.success) {
          throw new Error(result.error || "Error updating vehicle info");
        }
      } else {
        // Create new vehicle
        const result = await saveVehicleBasicInfo(carInfo);
        if (result.success && result.vehicleId) {
          setVehicleId(result.vehicleId);
        } else {
          throw new Error(result.error || "Error saving vehicle info");
        }
      }
      
      // Go to next step
      nextStep();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error al guardar la información");
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
      
      // Use the imported uploadVehiclePhotos function
      if (photosToUpload.length > 0) {
        // Extract only the files for the upload function
        const photoFiles = photosToUpload.map(p => p.file);
        const result = await uploadVehiclePhotos(vehicleId, photoFiles);
        
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
      // Calculate total credits needed
      const totalCredits = getTotalCostInCredits();
      
      // Build service description for the credit movement
      const selectedServices = [];
      
      // Base publication
      selectedServices.push('Publicación básica');
      
      // Additional services
      if (auctionInfo.services.includes('verification')) {
        selectedServices.push('Verificación mecánica');
      }
      if (auctionInfo.services.includes('photography')) {
        selectedServices.push('Fotografía profesional');
      }
      if (auctionInfo.services.includes('highlight')) {
        selectedServices.push('Destacar anuncio');
      }
      
      const serviceDescription = `Publicación de ${carInfo.brand} ${carInfo.model} ${carInfo.year} - Servicios: ${selectedServices.join(', ')}`;
      
      // Deduct all credits at once (including highlight service if selected)
      const creditResult = await processCreditsMovement(
        'publicacion',
        -totalCredits,
        serviceDescription
      );
      
      if (!creditResult.success) {
        if (creditResult.error?.includes('Saldo insuficiente')) {
          toast.error('No tienes créditos suficientes para completar esta publicación');
          return false;
        }
        toast.error(`Error al procesar los créditos: ${creditResult.error}`);
        return false;
      }

      // If highlight service is selected, mark the vehicle as highlighted
      // But DON'T create another credit movement since it's already included above
      if (auctionInfo.services.includes('highlight')) {
        const { highlightVehicle } = await import('@/services/highlightService');
        const highlightResult = await highlightVehicle(vehicleId, false); // Pass false to skip credit deduction
        
        if (!highlightResult.success) {
          console.error('Error highlighting vehicle:', highlightResult.error);
          // Don't fail the whole process if highlighting fails, just log it
        }
      }

      // Activar la subasta (quedará en draft hasta aprobación por admin)
      const result = await activateAuction(auctionId);
      
      if (result.success) {
        toast.success("¡Tu vehículo ha sido enviado para aprobación! Un administrador revisará la información pronto.");
        
        // Wait a second before redirecting to show the message
        return true;
      } else {
        toast.error("Ocurrió un error al finalizar el proceso");
        return false;
      }
    } catch (error) {
      toast.error("Ocurrió un error al procesar la solicitud");
      console.error(error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    saveStep1,
    saveStep2,
    saveStep3,
    finishProcess
  };
};
