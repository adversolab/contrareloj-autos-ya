
export async function getUserDocuments(userId: string): Promise<UserDocuments | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('rut, identity_document_url, identity_selfie_url')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error al obtener documentos:', error);
      toast.error('Error al cargar los documentos');
      return null;
    }
    
    console.log("Raw user documents data:", data);
    
    // Parse the JSON string in identity_document_url if it exists
    let frontUrl: string | undefined = undefined;
    let backUrl: string | undefined = undefined;
    
    if (data?.identity_document_url) {
      try {
        // Check if it's a JSON string
        if (typeof data.identity_document_url === 'string' && 
            (data.identity_document_url.startsWith('{') || data.identity_document_url.includes('front'))) {
          // Try to parse it as JSON
          const documentUrls = JSON.parse(data.identity_document_url);
          frontUrl = documentUrls.front;
          backUrl = documentUrls.back;
        } else {
          // If it doesn't look like JSON, use it as a direct URL
          frontUrl = data.identity_document_url;
        }
      } catch (e) {
        console.error('Error parsing document URL JSON:', e);
        // If parsing fails, assume it's a legacy format with just a single URL
        frontUrl = data.identity_document_url;
      }
    }
    
    console.log("Processed document URLs: front=", frontUrl, "back=", backUrl);
    
    return {
      rut: data?.rut,
      identity_document_url: data?.identity_document_url,
      identity_selfie_url: data?.identity_selfie_url,
      front_url: frontUrl,
      back_url: backUrl
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al cargar los documentos');
    return null;
  }
}
