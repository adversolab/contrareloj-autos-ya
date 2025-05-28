
import { supabase } from "@/integrations/supabase/client";
import { autoNotifications, getVehicleInfo, getUserInfo } from "./autoNotificationService";

// Servicio para manejar eventos del sistema y enviar notificaciones automáticas

export const systemEvents = {
  // Cuando se aprueba un vehículo
  onVehicleApproved: async (vehicleId: string) => {
    try {
      const vehicleInfo = await getVehicleInfo(vehicleId);
      if (!vehicleInfo) return;

      await autoNotifications.vehicleApproved(
        vehicleInfo.user_id,
        vehicleInfo.brand,
        vehicleInfo.model
      );
    } catch (error) {
      console.error('Error sending vehicle approval notification:', error);
    }
  },

  // Cuando se aprueba una subasta
  onAuctionApproved: async (auctionId: string) => {
    try {
      const { data: auction, error } = await supabase
        .from('auctions')
        .select(`
          id,
          vehicle:vehicles(brand, model, user_id)
        `)
        .eq('id', auctionId)
        .single();

      if (error || !auction || !auction.vehicle) return;

      await autoNotifications.auctionApproved(
        auction.vehicle.user_id,
        auction.vehicle.brand,
        auction.vehicle.model
      );
    } catch (error) {
      console.error('Error sending auction approval notification:', error);
    }
  },

  // Cuando termina una subasta con ganador
  onAuctionWon: async (auctionId: string, winnerId: string, winningBid: number) => {
    try {
      const { data: auction, error } = await supabase
        .from('auctions')
        .select(`
          id,
          vehicle:vehicles(brand, model, year)
        `)
        .eq('id', auctionId)
        .single();

      if (error || !auction || !auction.vehicle) return;

      await autoNotifications.auctionWon(
        winnerId,
        auction.vehicle.brand,
        auction.vehicle.model,
        auction.vehicle.year,
        winningBid
      );
    } catch (error) {
      console.error('Error sending auction won notification:', error);
    }
  },

  // Cuando termina una subasta sin ofertas
  onAuctionExpiredNoOffers: async (auctionId: string, ownerId: string) => {
    try {
      const { data: auction, error } = await supabase
        .from('auctions')
        .select(`
          id,
          vehicle:vehicles(brand, model, year)
        `)
        .eq('id', auctionId)
        .single();

      if (error || !auction || !auction.vehicle) return;

      await autoNotifications.auctionExpiredNoOffers(
        ownerId,
        auction.vehicle.brand,
        auction.vehicle.model,
        auction.vehicle.year
      );
    } catch (error) {
      console.error('Error sending auction expired notification:', error);
    }
  },

  // Cuando se agrega créditos manualmente
  onCreditsAdded: async (userId: string, amount: number, description: string) => {
    try {
      await autoNotifications.creditsAdded(userId, amount, description);
    } catch (error) {
      console.error('Error sending credits added notification:', error);
    }
  },

  // Cuando se bloquea una cuenta
  onAccountBlocked: async (userId: string, reason?: string) => {
    try {
      await autoNotifications.accountBlocked(userId, reason);
    } catch (error) {
      console.error('Error sending account blocked notification:', error);
    }
  },

  // Cuando se recibe una nueva valoración
  onRatingReceived: async (ratedUserId: string, rating: number, comment?: string) => {
    try {
      await autoNotifications.ratingReceived(ratedUserId, rating, comment);
    } catch (error) {
      console.error('Error sending rating received notification:', error);
    }
  },

  // Cuando se recibe una nueva oferta en subasta
  onBidReceived: async (auctionId: string, bidderId: string, bidAmount: number) => {
    try {
      const { data: auction, error } = await supabase
        .from('auctions')
        .select(`
          id,
          vehicle:vehicles(brand, model, user_id)
        `)
        .eq('id', auctionId)
        .single();

      if (error || !auction || !auction.vehicle) return;

      // Obtener información del postor
      const bidderInfo = await getUserInfo(bidderId);
      const bidderName = bidderInfo 
        ? `${bidderInfo.first_name || ''} ${bidderInfo.last_name || ''}`.trim() || bidderInfo.email
        : 'Un usuario';

      await autoNotifications.bidReceived(
        auction.vehicle.user_id,
        auction.vehicle.brand,
        auction.vehicle.model,
        bidAmount,
        bidderName
      );
    } catch (error) {
      console.error('Error sending bid received notification:', error);
    }
  },

  // Cuando se aplica una penalización
  onPenaltyApplied: async (userId: string, amount: number, reason: string) => {
    try {
      await autoNotifications.penaltyApplied(userId, Math.abs(amount), reason);
    } catch (error) {
      console.error('Error sending penalty applied notification:', error);
    }
  }
};

// Función para integrar eventos en operaciones existentes
export const integrateSystemNotifications = {
  // Llamar cuando se aprueba un vehículo en el admin
  approveVehicle: async (vehicleId: string) => {
    await systemEvents.onVehicleApproved(vehicleId);
  },

  // Llamar cuando se aprueba una subasta en el admin
  approveAuction: async (auctionId: string) => {
    await systemEvents.onAuctionApproved(auctionId);
  },

  // Llamar cuando se procesa un movimiento de crédito
  processCredits: async (userId: string, amount: number, description: string) => {
    if (amount > 0) {
      await systemEvents.onCreditsAdded(userId, amount, description);
    } else {
      await systemEvents.onPenaltyApplied(userId, amount, description);
    }
  },

  // Llamar cuando se bloquea un usuario
  blockUser: async (userId: string, reason?: string) => {
    await systemEvents.onAccountBlocked(userId, reason);
  },

  // Llamar cuando se crea una nueva valoración
  createRating: async (ratedUserId: string, rating: number, comment?: string) => {
    await systemEvents.onRatingReceived(ratedUserId, rating, comment);
  },

  // Llamar cuando se hace una nueva oferta
  createBid: async (auctionId: string, bidderId: string, bidAmount: number) => {
    await systemEvents.onBidReceived(auctionId, bidderId, bidAmount);
  }
};
