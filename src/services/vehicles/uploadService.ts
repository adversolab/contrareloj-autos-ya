
import { supabase } from "@/integrations/supabase/client";
import { UUID } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Uploads a photo to Supabase storage
 * 
 * @param file The file to upload
 * @param fileName The name to give the file
 * @param bucket The storage bucket to upload to
 * @returns Object with the public URL and an error if any
 */
export async function uploadPhoto(file: File, fileName: string = UUID(), bucket: string = 'vehicle-photos') {
  try {
    // Upload the file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(`${fileName}`, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error: any) {
    console.error("Error uploading photo:", error);
    return { url: null, error: error.message || 'Error al subir la foto' };
  }
}

/**
 * Uploads multiple photos for a vehicle
 * 
 * @param vehicleId The ID of the vehicle
 * @param files Array of files to upload
 * @returns Array of photo objects with URLs
 */
export async function uploadVehiclePhotos(vehicleId: string, files: File[]) {
  try {
    if (!files.length) return { photos: [], error: null };
    
    const photoPromises = files.map(async (file, index) => {
      const { url, error } = await uploadPhoto(file, `${vehicleId}/${UUID()}`);
      
      if (error) throw new Error(`Error uploading photo ${index + 1}: ${error}`);
      
      return {
        vehicle_id: vehicleId,
        url: url,
        is_primary: index === 0, // First photo is primary
        position: index
      };
    });
    
    const photos = await Promise.all(photoPromises);
    
    // Save photo records to the database
    const { data, error } = await supabase
      .from('vehicle_photos')
      .insert(photos)
      .select();
    
    if (error) throw error;
    
    return { photos: data, error: null };
  } catch (error: any) {
    console.error("Error uploading vehicle photos:", error);
    return { photos: [], error: error.message || 'Error al subir las fotos del vehículo' };
  }
}

/**
 * Uploads a photo for a vehicle
 * 
 * @param vehicleId The ID of the vehicle
 * @param photoData Object with file, isMain flag and position
 * @returns Object with success status, URL and error if any
 */
export async function uploadVehiclePhoto(vehicleId: string, photoData: { 
  file: File, 
  isMain?: boolean, 
  position: number 
}) {
  try {
    const { file, isMain = false, position } = photoData;
    const { url, error } = await uploadPhoto(file, `${vehicleId}/${UUID()}`);
    
    if (error) throw new Error(error);
    
    // Save photo record to the database
    const { data, error: insertError } = await supabase
      .from('vehicle_photos')
      .insert({
        vehicle_id: vehicleId,
        url: url,
        is_primary: isMain,
        position: position
      })
      .select();
    
    if (insertError) throw insertError;
    
    console.log("Vehicle photo uploaded successfully:", url);
    
    return { success: true, url, error: null, data };
  } catch (error: any) {
    console.error("Error uploading vehicle photo:", error);
    return { success: false, url: null, error: error.message || 'Error al subir la foto del vehículo' };
  }
}

/**
 * Uploads a report document (like Autofact) for a vehicle
 * 
 * @param vehicleId The ID of the vehicle
 * @param file The report file
 * @returns Object with the URL and an error if any
 */
export async function uploadVehicleReport(vehicleId: string, file: File) {
  try {
    const { url, error: uploadError } = await uploadPhoto(
      file, 
      `${vehicleId}/reports/${UUID()}_${file.name}`, 
      'vehicle-photos'
    );
    
    if (uploadError) throw new Error(uploadError);
    
    // Update the vehicle with the report URL
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId);
    
    if (updateError) throw updateError;
    
    return { url, error: null };
  } catch (error: any) {
    console.error("Error uploading vehicle report:", error);
    return { url: null, error: error.message || 'Error al subir el informe' };
  }
}

/**
 * Uploads an Autofact report for a vehicle
 * 
 * @param vehicleId The ID of the vehicle
 * @param file The report file 
 * @returns Object with success status, URL and error if any
 */
export async function uploadAutofactReport(vehicleId: string, file: File) {
  try {
    if (file.type !== 'application/pdf') {
      throw new Error('El archivo debe ser un PDF');
    }
    
    const { url, error: uploadError } = await uploadPhoto(
      file,
      `${vehicleId}/autofact/${UUID()}_${file.name}`,
      'vehicle-photos'
    );
    
    if (uploadError) throw new Error(uploadError);
    
    // Update the vehicle with the Autofact report URL
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        autofact_report_url: url,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId);
    
    if (updateError) throw updateError;
    
    console.log("Autofact report uploaded successfully:", url);
    
    return { success: true, url, error: null };
  } catch (error: any) {
    console.error("Error uploading Autofact report:", error);
    return { success: false, url: null, error: error.message || 'Error al subir el informe Autofact' };
  }
}
