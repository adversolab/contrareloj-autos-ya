
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "./notificationService";

// Función principal para enviar notificaciones automáticas
export async function enviarNotificacion(userId: string, titulo: string, mensaje: string, tipo: string = 'system') {
  try {
    const success = await createNotification(userId, titulo, mensaje, tipo);
    
    if (success) {
      console.log(`Notificación automática enviada a ${userId}: ${titulo}`);
    } else {
      console.error(`Error al enviar notificación automática a ${userId}`);
    }
    
    return success;
  } catch (error) {
    console.error('Error en enviarNotificacion:', error);
    return false;
  }
}

// Notificaciones específicas del sistema
export const autoNotifications = {
  // Aprobación de vehículo
  vehicleApproved: async (userId: string, vehicleBrand: string, vehicleModel: string) => {
    const titulo = "Vehículo aprobado";
    const mensaje = `Tu ${vehicleBrand} ${vehicleModel} ha sido aprobado y ya está visible para todos los usuarios.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'vehicle_approved');
  },

  // Subasta ganada
  auctionWon: async (userId: string, vehicleBrand: string, vehicleModel: string, vehicleYear: number, winningBid: number) => {
    const titulo = "¡Felicitaciones! Has ganado una subasta";
    const mensaje = `Has ganado la subasta del ${vehicleBrand} ${vehicleModel} ${vehicleYear} con una oferta de $${winningBid.toLocaleString()}. Pronto te contactaremos con los detalles.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'auction_won');
  },

  // Subasta terminada sin ofertas
  auctionExpiredNoOffers: async (userId: string, vehicleBrand: string, vehicleModel: string, vehicleYear: number) => {
    const titulo = "Subasta terminada sin ofertas";
    const mensaje = `Tu subasta del ${vehicleBrand} ${vehicleModel} ${vehicleYear} ha terminado sin recibir ofertas. Puedes reprogramarla si deseas.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'auction_no_offers');
  },

  // Créditos agregados manualmente
  creditsAdded: async (userId: string, amount: number, reason: string = 'ajuste de cuenta') => {
    const titulo = "Créditos agregados a tu cuenta";
    const mensaje = `Recibiste ${amount} créditos por ${reason}.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'credits_added');
  },

  // Cuenta bloqueada
  accountBlocked: async (userId: string, reason: string = 'incumplimiento de las normas de uso') => {
    const titulo = "Cuenta bloqueada";
    const mensaje = `Tu cuenta ha sido bloqueada por ${reason}. Para más información, contacta al soporte.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'account_blocked');
  },

  // Nueva valoración recibida
  ratingReceived: async (userId: string, rating: number, comment: string = '') => {
    const titulo = "Nueva valoración recibida";
    const mensaje = `Recibiste una nueva valoración de ${rating} estrellas${comment ? `: "${comment}"` : ''}. Puedes verla en tu perfil.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'rating_received');
  },

  // Oferta recibida en subasta
  bidReceived: async (userId: string, vehicleBrand: string, vehicleModel: string, bidAmount: number, bidderName: string) => {
    const titulo = "Nueva oferta en tu subasta";
    const mensaje = `${bidderName} hizo una oferta de $${bidAmount.toLocaleString()} en tu ${vehicleBrand} ${vehicleModel}.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'bid_received');
  },

  // Subasta aprobada
  auctionApproved: async (userId: string, vehicleBrand: string, vehicleModel: string) => {
    const titulo = "Subasta aprobada";
    const mensaje = `Tu subasta del ${vehicleBrand} ${vehicleModel} ha sido aprobada y ya está activa para todos los usuarios.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'auction_approved');
  },

  // Recordatorio de subasta próxima a finalizar
  auctionEndingSoon: async (userId: string, vehicleBrand: string, vehicleModel: string, hoursLeft: number) => {
    const titulo = "Tu subasta está por finalizar";
    const mensaje = `Tu subasta del ${vehicleBrand} ${vehicleModel} finaliza en ${hoursLeft} horas.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'auction_ending');
  },

  // Penalización aplicada
  penaltyApplied: async (userId: string, penaltyAmount: number, reason: string) => {
    const titulo = "Penalización aplicada";
    const mensaje = `Se aplicó una penalización de ${penaltyAmount} créditos por ${reason}.`;
    return await enviarNotificacion(userId, titulo, mensaje, 'penalty_applied');
  }
};

// Función para obtener información del vehículo (helper)
export async function getVehicleInfo(vehicleId: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .select('brand, model, year, user_id')
    .eq('id', vehicleId)
    .single();

  if (error) {
    console.error('Error fetching vehicle info:', error);
    return null;
  }

  return data;
}

// Función para obtener información del usuario (helper)
export async function getUserInfo(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user info:', error);
    return null;
  }

  return data;
}
