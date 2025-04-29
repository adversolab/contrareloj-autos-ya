
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Re-export all types and functions from the new modules
export * from './types/adminTypes';
export * from './userService';
export * from './vehicleService';
export * from './auctionService';

// Admin-specific functions
export async function deleteAuction(auctionId: string) {
  try {
    // First update any associated services
    const { error: servicesError } = await supabase
      .from('auction_services')
      .delete()
      .eq('auction_id', auctionId);
      
    if (servicesError) {
      console.error('Error al eliminar servicios de la subasta:', servicesError);
    }
    
    // Then update any associated questions
    const { error: questionsError } = await supabase
      .from('auction_questions')
      .delete()
      .eq('auction_id', auctionId);
      
    if (questionsError) {
      console.error('Error al eliminar preguntas de la subasta:', questionsError);
    }
    
    // Then delete any bids
    const { error: bidsError } = await supabase
      .from('bids')
      .delete()
      .eq('auction_id', auctionId);
      
    if (bidsError) {
      console.error('Error al eliminar pujas de la subasta:', bidsError);
    }
    
    // Finally delete the auction
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error al eliminar la subasta:', error);
      toast.error('Error al eliminar la subasta');
      return false;
    }
    
    toast.success('Subasta eliminada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al eliminar la subasta');
    return false;
  }
}

export async function pauseAuction(auctionId: string) {
  try {
    const { error } = await supabase
      .from('auctions')
      .update({ status: 'paused' })
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error al pausar la subasta:', error);
      toast.error('Error al pausar la subasta');
      return false;
    }
    
    toast.success('Subasta pausada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al pausar la subasta');
    return false;
  }
}

export async function approveAuction(auctionId: string) {
  try {
    const { error } = await supabase
      .from('auctions')
      .update({ 
        is_approved: true,
        status: 'active'
      })
      .eq('id', auctionId);
      
    if (error) {
      console.error('Error al aprobar la subasta:', error);
      toast.error('Error al aprobar la subasta');
      return false;
    }
    
    toast.success('Subasta aprobada correctamente');
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al aprobar la subasta');
    return false;
  }
}

export async function getUserDocuments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('rut, identity_document_url, identity_selfie_url')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error al obtener documentos del usuario:', error);
      toast.error('Error al obtener documentos del usuario');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al obtener documentos del usuario');
    return null;
  }
}
