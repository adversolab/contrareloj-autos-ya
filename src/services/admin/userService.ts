
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminUser, UserDocuments } from './types';

// User management functions
export async function getUsers() {
  try {
    console.log('Admin service: Fetching all users from profiles table...');
    
    // Fetch all profiles without filters
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
      return { users: [] };
    }
    
    console.log("Admin service: Raw profiles data:", data);
    console.log('Admin service: Number of profiles returned:', data ? data.length : 0);
    
    // Additional verification
    if (!data || !Array.isArray(data)) {
      console.error('Admin service: Data returned is not an array or is null:', data);
      return { users: [] };
    }
    
    // Process the user data to determine document availability
    const users: AdminUser[] = data.map(user => ({
      id: user.id,
      email: user.email || '',
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role as "user" | "admin" | "moderator",
      identity_verified: user.identity_verified || false,
      has_identity_document: Boolean(user.identity_document_url),
      has_selfie: Boolean(user.identity_selfie_url),
      has_rut: Boolean(user.rut),
      created_at: user.created_at || new Date().toISOString()
    }));
    
    console.log("Admin service: Total users found:", users.length);
    console.log("Admin service: Users details:", users.map(u => ({id: u.id, email: u.email})));
    
    return { users };
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Error loading users');
    return { users: [] };
  }
}

export async function verifyUser(userId: string) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ identity_verified: true })
      .eq('id', userId);
      
    if (error) {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify the user');
      return false;
    }
    
    toast.success('User verified successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to verify the user');
    return false;
  }
}

export async function updateUserRole(userId: string, role: "user" | "admin" | "moderator") {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
      
    if (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
      return false;
    }
    
    toast.success('Role updated successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('Failed to update user role');
    return false;
  }
}

export async function getUserDocuments(userId: string): Promise<UserDocuments | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('rut, identity_document_url, identity_selfie_url')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching documents:', error);
      toast.error('Error loading user documents');
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
            (data.identity_document_url.startsWith('{') || data.identity_document_url.includes('front') || data.identity_document_url.includes('"'))) {
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
    console.error('Unexpected error:', error);
    toast.error('Error loading user documents');
    return null;
  }
}
