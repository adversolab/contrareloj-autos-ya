
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
      
      // Añade políticas de seguridad para el bucket
      // Normalmente se haría con RLS, pero aquí usamos el cliente para mantener la simplicidad
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false };
  }
}

// Llamar a esta función al inicializar la aplicación
createIdentityDocumentsBucket().catch(console.error);
