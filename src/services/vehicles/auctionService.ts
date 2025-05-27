
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/authService";
import { getVerificationStatus } from "./identityService";
import { deductCreditsForBid } from "@/services/creditService";
import { AuctionInfo } from "./types";

export async function saveAuctionInfo(vehicleId: string, info: AuctionInfo): Promise<{ success: boolean; auctionId?: string }> {
  try {
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + info.durationDays);

    // Insert auction record
    const { data, error } = await supabase
      .from('auctions')
      .insert({
        vehicle_id: vehicleId,
        start_price: info.startPrice,
        reserve_price: info.reservePrice,
        min_increment: info.minIncrement,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'draft',  // Todas las subastas comienzan como borrador
        is_approved: false, // Requiere aprobación del admin
        duration_days: info.durationDays
      })
      .select()
      .single();

    if (error) {
      console.error('Error al guardar información de subasta:', error);
      toast.error('Error al guardar la información de la subasta');
      return { success: false };
    }

    // Handle services separately if needed in a separate table
    if (info.services && info.services.length > 0) {
      // Add price to each service (default value of 0)
      const servicesToInsert = info.services.map(service => ({
        auction_id: data.id,
        service_type: service,
        price: 0 // Add default price value
      }));

      const { error: servicesError } = await supabase
        .from('auction_services')
        .insert(servicesToInsert);
        
      if (servicesError) {
        console.error('Error al guardar servicios:', servicesError);
        // Continue without failing the whole process
      }
    }

    return { success: true, auctionId: data.id };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la información de la subasta');
    return { success: false };
  }
}

export async function activateAuction(auctionId: string): Promise<{ success: boolean }> {
  try {
    // Cambiamos a "pending_approval" para indicar que está lista para revisión
    const { error } = await supabase
      .from('auctions')
      .update({ status: 'pending_approval' })
      .eq('id', auctionId);

    if (error) {
      console.error('Error al activar subasta:', error);
      toast.error('Error al enviar la subasta para aprobación');
      return { success: false };
    }

    toast.success('¡Tu subasta ha sido enviada a revisión!');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al enviar la subasta para aprobación');
    return { success: false };
  }
}

export async function getAuctionById(id: string) {
  try {
    const { data, error } = await supabase
      .from('auctions')
      .select(`
        *,
        vehicles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener subasta:', error);
      return { auction: null, error };
    }

    return { auction: data, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { auction: null, error };
  }
}

export async function finalizeAuction(auctionId: string) {
  try {
    // Get the highest bid
    const { data: bids } = await supabase
      .from('bids')
      .select('id, user_id, amount')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1);

    const winnerId = bids && bids.length > 0 ? bids[0].user_id : null;

    // Update auction status
    const { error } = await supabase
      .from('auctions')
      .update({
        status: 'finished',
        winner_id: winnerId,
        winning_bid: winnerId ? bids[0].amount : null
      })
      .eq('id', auctionId);

    if (error) {
      console.error('Error al finalizar subasta:', error);
      toast.error('Error al finalizar la subasta');
      return { success: false, winnerId: null };
    }

    return { success: true, winnerId };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al finalizar la subasta');
    return { success: false, winnerId: null };
  }
}

export async function placeBid(auctionId: string, bidData: { amount: number, holdAmount: number }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para participar');
      return { success: false, needsVerification: false, needsCredits: false };
    }

    // Check if user is verified
    const { isVerified } = await getVerificationStatus();
    if (!isVerified) {
      toast.error('Debes verificar tu identidad para ofertar');
      return { success: false, needsVerification: true, needsCredits: false };
    }

    // Get auction details for credit deduction description
    const { auction } = await getAuctionById(auctionId);
    const auctionTitle = auction?.vehicles 
      ? `${auction.vehicles.brand} ${auction.vehicles.model} ${auction.vehicles.year}`
      : 'vehículo';

    // Deduct credits for bid
    const creditResult = await deductCreditsForBid(auctionTitle);
    if (!creditResult.success) {
      if (creditResult.error === 'insufficient_credits') {
        return { success: false, needsVerification: false, needsCredits: true };
      }
      return { success: false, needsVerification: false, needsCredits: false };
    }

    // Place the bid
    const { error } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        user_id: user.id,
        amount: bidData.amount,
        hold_amount: bidData.holdAmount
      });

    if (error) {
      console.error('Error al realizar oferta:', error);
      toast.error('Error al procesar tu oferta');
      return { success: false, needsVerification: false, needsCredits: false };
    }

    toast.success('¡Oferta realizada con éxito! Se descontó 1 crédito.');
    return { success: true, needsVerification: false, needsCredits: false };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la oferta');
    return { success: false, needsVerification: false, needsCredits: false };
  }
}
