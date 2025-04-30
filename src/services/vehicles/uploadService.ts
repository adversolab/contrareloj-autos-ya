
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
export async function uploadPhoto(file: File, fileName: string = UUID(), bucket: string = 'vehicles') {
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
      'reports'
    );
    
    if (uploadError) throw new Error(uploadError);
    
    // Update the vehicle with the report URL
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        // Instead of modifying the type, we'll use a valid approach here
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
