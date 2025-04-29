
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function createIdentityDocumentsBucket() {
  try {
    // Verifica si el bucket ya existe
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error('Error al listar buckets:', error);
      return { success: false };
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'identity_docs');
    
    if (!bucketExists) {
      // Crea el bucket si no existe
      const { error: createError } = await supabase
        .storage
        .createBucket('identity_docs', {
          public: false,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
        });
      
      if (createError) {
        console.error('Error al crear bucket:', createError);
        return { success: false };
      }
      
      console.log('Bucket identity_docs creado exitosamente');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false };
  }
}

// Función para subir archivos al bucket de documentos de identidad
export async function uploadIdentityFile(file: File, fileName: string, isSelfie: boolean = false) {
  try {
    // Asegurar que el bucket existe
    const { success: bucketSuccess } = await createIdentityDocumentsBucket();
    if (!bucketSuccess) {
      toast.error("Error al preparar el almacenamiento");
      return { success: false, url: null };
    }
    
    // Determinar la ruta dentro del bucket
    const folderPath = isSelfie ? 'selfies' : 'documents';
    const filePath = `${folderPath}/${fileName}`;
    
    // Subir el archivo
    const { data, error } = await supabase.storage
      .from('identity_docs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // No sobrescribir archivos existentes con el mismo nombre
      });
    
    if (error) {
      console.error('Error al subir archivo:', error);
      toast.error("Error al subir el archivo");
      return { success: false, url: null };
    }
    
    // Obtener URL pública (o firmada si el bucket es privado)
    const { data: urlData } = await supabase.storage
      .from('identity_docs')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // URL válida por 7 días
    
    return { 
      success: true, 
      url: urlData?.signedUrl || null,
      path: data?.path || null
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error("Error inesperado al procesar el archivo");
    return { success: false, url: null };
  }
}

// Llamar a esta función al inicializar la aplicación
createIdentityDocumentsBucket().catch(console.error);
