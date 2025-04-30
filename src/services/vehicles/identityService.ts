
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/authService";

export async function updateRutInfo(rut: string): Promise<{ success: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para actualizar tu información');
      return { success: false };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ rut })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error al actualizar RUT:', error);
      toast.error('Error al guardar tu RUT');
      return { success: false };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la solicitud');
    return { success: false };
  }
}

export async function uploadIdentityDocument(file: File, isSelfie: boolean = false): Promise<{ url: string; success: boolean }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para subir documentos');
      return { url: '', success: false };
    }
    
    // Create a unique filename using a timestamp and the user ID
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${isSelfie ? 'selfie' : 'document'}_${timestamp}.${fileExt}`;
    
    // Use the right path based on whether it's a selfie or a document
    const filePath = isSelfie 
      ? `identity_verification/${user.id}/selfie`
      : `identity_verification/${user.id}/document`;
    
    // Upload the file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('identity_docs')
      .upload(`${filePath}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error al subir el documento:', uploadError);
      toast.error('Error al subir el documento. Por favor intenta de nuevo.');
      return { url: '', success: false };
    }
    
    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('identity_docs')
      .getPublicUrl(`${filePath}/${fileName}`);
    
    const url = publicUrlData?.publicUrl || '';
    
    // Update the user profile with the document URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update(isSelfie 
        ? { identity_selfie_url: url } 
        : { identity_document_url: url }
      )
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error al actualizar el perfil:', updateError);
      toast.error('Error al guardar la información. Por favor intenta de nuevo.');
      return { url, success: false };
    }
    
    return { url, success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la solicitud');
    return { url: '', success: false };
  }
}

export async function getVerificationStatus(): Promise<{
  isVerified: boolean;
  hasRut: boolean;
  hasDocuments: boolean;
  hasSelfie: boolean;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        isVerified: false,
        hasRut: false,
        hasDocuments: false,
        hasSelfie: false
      };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('rut, identity_document_url, identity_selfie_url, identity_verified')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error al obtener estado de verificación:', error);
      return {
        isVerified: false,
        hasRut: false,
        hasDocuments: false,
        hasSelfie: false
      };
    }
    
    return {
      isVerified: data?.identity_verified || false,
      hasRut: !!data?.rut,
      hasDocuments: !!data?.identity_document_url,
      hasSelfie: !!data?.identity_selfie_url
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return {
      isVerified: false,
      hasRut: false,
      hasDocuments: false,
      hasSelfie: false
    };
  }
}
