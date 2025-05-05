
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
    console.log(`Uploading photo to ${bucket}/${fileName}`);
    
    // Upload the file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(`${fileName}`, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    console.log("Upload successful, URL:", publicUrlData.publicUrl);
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
    
    console.log(`Uploading ${files.length} photos for vehicle ${vehicleId}`);
    
    const photoPromises = files.map(async (file, index) => {
      const filePath = `vehicles/${vehicleId}/${UUID()}`;
      const { url, error } = await uploadPhoto(file, filePath);
      
      if (error) {
        console.error(`Error uploading photo ${index + 1}:`, error);
        throw new Error(`Error uploading photo ${index + 1}: ${error}`);
      }
      
      console.log(`Photo ${index + 1} uploaded successfully:`, url);
      
      return {
        vehicle_id: vehicleId,
        url: url,
        is_primary: index === 0, // First photo is primary
        position: index
      };
    });
    
    const photos = await Promise.all(photoPromises);
    console.log("All photos uploaded, saving to database:", photos);
    
    // Save photo records to the database
    const { data, error } = await supabase
      .from('vehicle_photos')
      .insert(photos)
      .select();
    
    if (error) {
      console.error("Error saving photos to database:", error);
      throw error;
    }
    
    console.log("Photos saved to database:", data);
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
    const filePath = `vehicles/${vehicleId}/${UUID()}`;
    
    console.log(`Uploading vehicle photo to ${filePath}, isMain: ${isMain}, position: ${position}`);
    
    const { url, error } = await uploadPhoto(file, filePath);
    
    if (error) {
      console.error("Error uploading vehicle photo:", error);
      throw new Error(error);
    }
    
    console.log("Photo uploaded successfully, saving to database:", url);
    
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
    
    if (insertError) {
      console.error("Error saving photo to database:", insertError);
      throw insertError;
    }
    
    console.log("Vehicle photo saved to database:", data);
    
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
    const filePath = `vehicles/${vehicleId}/reports/${UUID()}_${file.name}`;
    console.log(`Uploading vehicle report to ${filePath}`);
    
    const { url, error: uploadError } = await uploadPhoto(file, filePath);
    
    if (uploadError) {
      console.error("Error uploading vehicle report:", uploadError);
      throw new Error(uploadError);
    }
    
    console.log("Report uploaded successfully:", url);
    
    // Update the vehicle with the report URL
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId);
    
    if (updateError) {
      console.error("Error updating vehicle:", updateError);
      throw updateError;
    }
    
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
    
    const filePath = `vehicles/${vehicleId}/autofact/${UUID()}_${file.name}`;
    console.log(`Uploading Autofact report to ${filePath}`);
    
    const { url, error: uploadError } = await uploadPhoto(file, filePath);
    
    if (uploadError) {
      console.error("Error uploading Autofact report:", uploadError);
      throw new Error(uploadError);
    }
    
    console.log("Autofact report uploaded successfully:", url);
    
    // Update the vehicle with the Autofact report URL
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        autofact_report_url: url,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId);
    
    if (updateError) {
      console.error("Error updating vehicle with report URL:", updateError);
      throw updateError;
    }
    
    return { success: true, url, error: null };
  } catch (error: any) {
    console.error("Error uploading Autofact report:", error);
    return { success: false, url: null, error: error.message || 'Error al subir el informe Autofact' };
  }
}
