
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function createIdentityDocumentsBucket() {
  try {
    // Check if the bucket already exists
    const { data: buckets, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return { success: false };
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'identity_docs');
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase
        .storage
        .createBucket('identity_docs', {
          public: false,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg']
        });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return { success: false };
      }
      
      console.log('Bucket identity_docs created successfully');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false };
  }
}

// Function to upload files to the identity documents bucket
export async function uploadIdentityFile(file: File, fileName: string, isSelfie: boolean = false) {
  try {
    // Ensure the bucket exists
    const { success: bucketSuccess } = await createIdentityDocumentsBucket();
    if (!bucketSuccess) {
      console.error("Failed to create or verify bucket");
      toast.error("Error al preparar el almacenamiento");
      return { success: false, url: null };
    }
    
    // Determine the path within the bucket
    const folderPath = isSelfie ? 'selfies' : 'documents';
    const filePath = `${folderPath}/${fileName}`;
    
    console.log(`Uploading file to identity_docs/${filePath}`);
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from('identity_docs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing files with the same name
      });
    
    if (error) {
      console.error('File upload error:', error);
      return { success: false, url: null };
    }
    
    // Get public URL (or signed URL if the bucket is private)
    const { data: urlData } = await supabase.storage
      .from('identity_docs')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // URL valid for 7 days
    
    console.log("File uploaded successfully, URL:", urlData?.signedUrl);
    
    return { 
      success: true, 
      url: urlData?.signedUrl || null,
      path: data?.path || null
    };
  } catch (error) {
    console.error('Unexpected error during file upload:', error);
    return { success: false, url: null };
  }
}

// Call this function when initializing the application
createIdentityDocumentsBucket().catch(console.error);
