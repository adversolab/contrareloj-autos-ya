
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function uploadVehiclePhoto(
  vehicleId: string, 
  { file, isMain = false, position = 0 }: { file: File; isMain?: boolean; position: number }
): Promise<{ success: boolean; url?: string }> {
  try {
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${vehicleId}_${timestamp}_${position}.${fileExt}`;
    const filePath = `vehicles/${vehicleId}/${fileName}`;

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('vehicle_photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error al subir foto:', uploadError);
      toast.error('Error al subir la foto');
      return { success: false };
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('vehicle_photos')
      .getPublicUrl(filePath);

    const url = publicUrlData?.publicUrl || '';

    // Save the photo info in the database
    const { error: dbError } = await supabase
      .from('vehicle_photos')
      .insert({
        vehicle_id: vehicleId,
        url,
        position,
        is_primary: isMain
      });

    if (dbError) {
      console.error('Error al guardar foto en BD:', dbError);
      toast.error('Error al registrar la foto');
      return { success: false, url };
    }

    return { success: true, url };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la foto');
    return { success: false };
  }
}

// Function to upload Autofact report
export async function uploadAutofactReport(
  vehicleId: string, 
  file: File
): Promise<{ success: boolean; url?: string }> {
  try {
    const timestamp = new Date().getTime();
    const fileName = `autofact_${vehicleId}_${timestamp}.pdf`;
    const filePath = `vehicles/${vehicleId}/autofact/${fileName}`;

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from('vehicle_photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error al subir informe Autofact:', uploadError);
      toast.error('Error al subir el informe Autofact');
      return { success: false };
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('vehicle_photos')
      .getPublicUrl(filePath);

    const url = publicUrlData?.publicUrl || '';

    // Update the vehicle with the Autofact report URL
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ 
        autofact_report_url: url 
      })
      .eq('id', vehicleId);

    if (updateError) {
      console.error('Error al actualizar vehículo con URL de informe Autofact:', updateError);
      toast.error('Error al registrar el informe Autofact');
      return { success: false, url };
    }

    return { success: true, url };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar el informe Autofact');
    return { success: false };
  }
}
