
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/authService";

// Questions and answers
export async function getAuctionQuestions(auctionId: string) {
  try {
    // First, get questions without profiles join
    const { data: questionsData, error } = await supabase
      .from('auction_questions')
      .select('*')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener preguntas:', error);
      return { questions: [], error };
    }

    // Then get user profiles for each question
    const questionsWithProfiles = await Promise.all(
      questionsData.map(async (question) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', question.user_id)
          .single();

        return {
          ...question,
          profiles: profileData || { first_name: null, last_name: null }
        };
      })
    );

    return { questions: questionsWithProfiles, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { questions: [], error };
  }
}

export async function getAuctionBids(auctionId: string) {
  try {
    // First, get bids without profiles join
    const { data: bidsData, error } = await supabase
      .from('bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false });

    if (error) {
      console.error('Error al obtener pujas:', error);
      return { bids: [], error };
    }

    // Then get user profiles for each bid
    const bidsWithProfiles = await Promise.all(
      bidsData.map(async (bid) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', bid.user_id)
          .single();

        return {
          ...bid,
          profiles: profileData || { first_name: null, last_name: null }
        };
      })
    );

    return { bids: bidsWithProfiles, error: null };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { bids: [], error };
  }
}

export async function submitQuestion(auctionId: string, questionText: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para hacer preguntas');
      return { success: false };
    }

    const { error } = await supabase
      .from('auction_questions')
      .insert({
        auction_id: auctionId,
        user_id: user.id,
        question: questionText
      });

    if (error) {
      console.error('Error al enviar pregunta:', error);
      toast.error('Error al enviar la pregunta');
      return { success: false };
    }

    toast.success('Tu pregunta ha sido enviada');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la pregunta');
    return { success: false };
  }
}

export async function answerQuestion(questionId: string, answerText: string) {
  try {
    const { error } = await supabase
      .from('auction_questions')
      .update({
        answer: answerText,
        answered_at: new Date().toISOString()
      })
      .eq('id', questionId);

    if (error) {
      console.error('Error al responder pregunta:', error);
      toast.error('Error al enviar la respuesta');
      return { success: false };
    }

    toast.success('Respuesta enviada correctamente');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al procesar la respuesta');
    return { success: false };
  }
}

// Favorites handling
export async function addToFavorites(auctionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return { success: false };
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        auction_id: auctionId
      });

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        // Already favorited
        return { success: true };
      }

      console.error('Error al guardar favorito:', error);
      toast.error('Error al guardar en favoritos');
      return { success: false };
    }

    toast.success('Guardado en favoritos');
    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al guardar en favoritos');
    return { success: false };
  }
}

export async function removeFromFavorites(auctionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false };
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({
        user_id: user.id,
        auction_id: auctionId
      });

    if (error) {
      console.error('Error al eliminar favorito:', error);
      toast.error('Error al eliminar de favoritos');
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Error inesperado:', error);
    toast.error('Error al eliminar de favoritos');
    return { success: false };
  }
}

export async function isFavorite(auctionId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { isFavorite: false };
    }

    const { data, error } = await supabase
      .from('favorites')
      .select()
      .match({
        user_id: user.id,
        auction_id: auctionId
      });

    if (error) {
      console.error('Error al verificar favorito:', error);
      return { isFavorite: false };
    }

    return { isFavorite: data.length > 0 };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { isFavorite: false };
  }
}
