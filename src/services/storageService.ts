
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to upload files to the identity documents bucket
export async function uploadIdentityFile(file: File, fileName: string, isSelfie: boolean = false) {
  try {
    // Determine the path within the bucket
    const folderPath = isSelfie ? 'identity/selfies' : 'identity/documents';
    const filePath = `${folderPath}/${fileName}`;
    
    console.log(`Uploading file to vehicle-photos/${filePath}`);
    
    // Upload the file to the existing vehicle-photos bucket
    const { data, error } = await supabase.storage
      .from('vehicle-photos')
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
      .from('vehicle-photos')
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
