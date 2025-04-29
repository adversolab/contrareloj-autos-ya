
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

// Get published vehicles for a user
export async function getUserVehicles(userId: string) {
  try {
    // Get the vehicles for this user
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        id, 
        brand, 
        model, 
        year, 
        kilometers, 
        fuel, 
        transmission,
        description,
        vehicle_photos(url, is_primary),
        auctions(id, start_price, reserve_price, status, start_date, end_date)
      `)
      .eq('user_id', userId);

    if (error) {
      toast.error(error.message);
      return { error, vehicles: [] };
    }

    // Process the vehicles to format them for display
    const formattedVehicles = vehicles.map(vehicle => {
      const mainPhoto = vehicle.vehicle_photos.find((photo: any) => photo.is_primary) || 
                        (vehicle.vehicle_photos.length > 0 ? vehicle.vehicle_photos[0] : null);
      const auction = vehicle.auctions.length > 0 ? vehicle.auctions[0] : null;
      
      return {
        id: vehicle.id,
        title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        description: vehicle.description || `${vehicle.fuel}, ${vehicle.transmission}, ${vehicle.kilometers.toLocaleString()} km`,
        imageUrl: mainPhoto ? mainPhoto.url : 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        currentBid: auction ? auction.start_price : 0,
        endTime: auction && auction.end_date ? new Date(auction.end_date) : new Date(Date.now() + 7 * 24 * 3600 * 1000),
        bidCount: 0, // Default to 0 since we don't have this info yet
        status: auction ? auction.status : 'draft',
        auctionId: auction ? auction.id : null,
      };
    });

    return { error: null, vehicles: formattedVehicles };
  } catch (error: any) {
    toast.error(error.message || "Error al obtener vehículos del usuario");
    return { error, vehicles: [] };
  }
}

// Get auction details by ID
export async function getAuctionById(auctionId: string) {
  try {
    const { data: auction, error } = await supabase
      .from('auctions')
      .select(`
        id,
        status,
        start_price,
        reserve_price,
        min_increment,
        start_date,
        end_date,
        vehicles (
          id,
          brand,
          model,
          year,
          kilometers,
          fuel,
          transmission,
          description,
          user_id,
          vehicle_photos (
            id,
            url,
            is_primary,
            position
          ),
          vehicle_features (
            id,
            category,
            feature
          )
        )
      `)
      .eq('id', auctionId)
      .single();

    if (error) {
      toast.error("Error al cargar los detalles de la subasta");
      console.error(error);
      return { error, auction: null };
    }

    if (!auction) {
      return { error: new Error("Subasta no encontrada"), auction: null };
    }
    
    return { error: null, auction };
  } catch (error: any) {
    toast.error("Error al cargar los detalles de la subasta");
    console.error(error);
    return { error, auction: null };
  }
}
