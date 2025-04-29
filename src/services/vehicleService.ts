
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VehicleBasicInfo {
  brand: string;
  model: string;
  year: string;
  kilometers: string;
  fuel: string;
  transmission: string;
  description: string;
}

export interface VehicleFeature {
  category: string;
  feature: string;
}

export interface VehiclePhoto {
  file: File;
  isMain?: boolean;
  position: number;
}

export interface AuctionInfo {
  reservePrice: number;
  startPrice: number;
  durationDays: number;
  minIncrement: number;
  services: string[];
}

// Guardar información básica del vehículo
export async function saveVehicleBasicInfo(data: VehicleBasicInfo) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast.error("Debes iniciar sesión para publicar un vehículo");
      return { error: new Error("Usuario no autenticado"), vehicle: null };
    }

    // Convertir string a número
    const kilometers = parseInt(data.kilometers.replace(/\D/g, ''));
    const year = parseInt(data.year);

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: user.data.user.id,
        brand: data.brand,
        model: data.model,
        year: year,
        kilometers: kilometers,
        fuel: data.fuel,
        transmission: data.transmission,
        description: data.description
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return { error, vehicle: null };
    }

    toast.success("Información básica guardada correctamente");
    return { error: null, vehicle };
  } catch (error: any) {
    toast.error(error.message || "Error al guardar la información");
    return { error, vehicle: null };
  }
}

// Actualizar información básica del vehículo
export async function updateVehicleBasicInfo(vehicleId: string, data: VehicleBasicInfo) {
  try {
    // Convertir string a número
    const kilometers = parseInt(data.kilometers.replace(/\D/g, ''));
    const year = parseInt(data.year);

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update({
        brand: data.brand,
        model: data.model,
        year: year,
        kilometers: kilometers,
        fuel: data.fuel,
        transmission: data.transmission,
        description: data.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return { error, vehicle: null };
    }

    toast.success("Información actualizada correctamente");
    return { error: null, vehicle };
  } catch (error: any) {
    toast.error(error.message || "Error al actualizar la información");
    return { error, vehicle: null };
  }
}

// Guardar características del vehículo
export async function saveVehicleFeatures(vehicleId: string, features: VehicleFeature[]) {
  try {
    // Primero eliminamos las características existentes
    const { error: deleteError } = await supabase
      .from('vehicle_features')
      .delete()
      .eq('vehicle_id', vehicleId);

    if (deleteError) {
      toast.error(deleteError.message);
      return { error: deleteError };
    }

    // Insertamos las nuevas características
    const { error } = await supabase
      .from('vehicle_features')
      .insert(
        features.map(f => ({
          vehicle_id: vehicleId,
          category: f.category,
          feature: f.feature
        }))
      );

    if (error) {
      toast.error(error.message);
      return { error };
    }

    toast.success("Características guardadas correctamente");
    return { error: null };
  } catch (error: any) {
    toast.error(error.message || "Error al guardar las características");
    return { error };
  }
}

// Subir una foto y guardarla en la base de datos
export async function uploadVehiclePhoto(vehicleId: string, photo: VehiclePhoto) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      return { error: new Error("Usuario no autenticado"), url: null };
    }

    const fileExt = photo.file.name.split('.').pop();
    const fileName = `${vehicleId}/${Date.now()}.${fileExt}`;
    const filePath = `${user.data.user.id}/${fileName}`;

    // Subir la foto a Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from('vehicle-photos')
      .upload(filePath, photo.file);

    if (uploadError) {
      toast.error(uploadError.message);
      return { error: uploadError, url: null };
    }

    // Obtener la URL de la foto
    const { data: urlData } = supabase.storage
      .from('vehicle-photos')
      .getPublicUrl(filePath);

    // Guardar la referencia en la base de datos
    const { error: dbError } = await supabase
      .from('vehicle_photos')
      .insert({
        vehicle_id: vehicleId,
        url: urlData.publicUrl,
        is_primary: photo.isMain || false,
        position: photo.position
      });

    if (dbError) {
      toast.error(dbError.message);
      return { error: dbError, url: null };
    }

    return { error: null, url: urlData.publicUrl };
  } catch (error: any) {
    toast.error(error.message || "Error al subir la foto");
    return { error, url: null };
  }
}

// Guardar información de la subasta
export async function saveAuctionInfo(vehicleId: string, auctionInfo: AuctionInfo) {
  try {
    // Crear la subasta
    const { data: auction, error } = await supabase
      .from('auctions')
      .insert({
        vehicle_id: vehicleId,
        reserve_price: auctionInfo.reservePrice,
        start_price: auctionInfo.startPrice,
        duration_days: auctionInfo.durationDays,
        min_increment: auctionInfo.minIncrement
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return { error, auction: null };
    }

    // Si hay servicios adicionales, guardarlos
    if (auctionInfo.services && auctionInfo.services.length > 0) {
      const servicePrices = {
        verification: 80000,
        photography: 50000,
        highlight: 30000
      };

      const services = auctionInfo.services.map(service => ({
        auction_id: auction.id,
        service_type: service,
        price: servicePrices[service as keyof typeof servicePrices]
      }));

      const { error: servicesError } = await supabase
        .from('auction_services')
        .insert(services);

      if (servicesError) {
        toast.error(servicesError.message);
        return { error: servicesError, auction };
      }
    }

    toast.success("Información de la subasta guardada correctamente");
    return { error: null, auction };
  } catch (error: any) {
    toast.error(error.message || "Error al guardar la información de la subasta");
    return { error, auction: null };
  }
}

// Activar una subasta
export async function activateAuction(auctionId: string) {
  try {
    const startDate = new Date();
    const endDate = new Date();
    
    // Obtener la duración de la subasta
    const { data: auction } = await supabase
      .from('auctions')
      .select('duration_days')
      .eq('id', auctionId)
      .single();
      
    if (auction) {
      endDate.setDate(endDate.getDate() + auction.duration_days);
    } else {
      endDate.setDate(endDate.getDate() + 7); // Por defecto 7 días
    }

    const { data, error } = await supabase
      .from('auctions')
      .update({
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .eq('id', auctionId)
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      return { error, auction: null };
    }

    toast.success("Subasta activada correctamente");
    return { error: null, auction: data };
  } catch (error: any) {
    toast.error(error.message || "Error al activar la subasta");
    return { error, auction: null };
  }
}
