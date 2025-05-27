
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreditMovement {
  id: string;
  usuario_id: string;
  tipo: 'compra' | 'puja' | 'publicacion' | 'destacar' | 'renovacion' | 'penalizacion' | 'bono';
  cantidad: number;
  descripcion: string;
  fecha: string;
  created_at: string;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'basic',
    name: 'Pack Básico',
    credits: 10,
    price: 10000,
    description: '10 créditos para participar en subastas'
  },
  {
    id: 'standard',
    name: 'Pack Estándar',
    credits: 30,
    price: 25000,
    description: '30 créditos con descuento del 17%'
  },
  {
    id: 'pro',
    name: 'Pack Pro',
    credits: 100,
    price: 75000,
    description: '100 créditos con descuento del 25%'
  },
  {
    id: 'turbo',
    name: 'Pack Turbo',
    credits: 250,
    price: 150000,
    description: '250 créditos con descuento del 40%'
  }
];

export async function getUserCredits(): Promise<{ credits: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { credits: 0, error: 'Usuario no autenticado' };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('saldo_creditos')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error al obtener créditos:', error);
      return { credits: 0, error: 'Error al obtener créditos' };
    }

    return { credits: profile?.saldo_creditos || 0 };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { credits: 0, error: 'Error inesperado' };
  }
}

export async function getCreditMovements(): Promise<{ movements: CreditMovement[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { movements: [], error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('movimientos_credito')
      .select('*')
      .eq('usuario_id', user.id)
      .order('fecha', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error al obtener movimientos:', error);
      return { movements: [], error: 'Error al obtener movimientos' };
    }

    return { movements: data || [] };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { movements: [], error: 'Error inesperado' };
  }
}

export async function processCreditsMovement(
  tipo: CreditMovement['tipo'],
  cantidad: number,
  descripcion: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase.rpc('procesar_movimiento_credito', {
      p_usuario_id: user.id,
      p_tipo: tipo,
      p_cantidad: cantidad,
      p_descripcion: descripcion
    });

    if (error) {
      console.error('Error al procesar movimiento:', error);
      return { success: false, error: 'Error al procesar movimiento' };
    }

    if (!data.success) {
      return { 
        success: false, 
        error: data.error || 'Error desconocido'
      };
    }

    return { 
      success: true, 
      newBalance: data.saldo_nuevo 
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { success: false, error: 'Error inesperado' };
  }
}

export async function deductCreditsForBid(auctionTitle: string): Promise<{ success: boolean; error?: string }> {
  const result = await processCreditsMovement(
    'puja',
    -1,
    `Puja por ${auctionTitle}`
  );

  if (!result.success) {
    if (result.error?.includes('Saldo insuficiente')) {
      toast.error('No tienes créditos suficientes para pujar. Compra un pack aquí.');
      return { success: false, error: 'insufficient_credits' };
    }
    toast.error('Error al procesar los créditos');
    return { success: false, error: result.error };
  }

  return { success: true };
}

export async function addCreditsFromPurchase(pack: CreditPack): Promise<{ success: boolean; error?: string }> {
  return await processCreditsMovement(
    'compra',
    pack.credits,
    `Compra ${pack.name} - ${pack.credits} créditos`
  );
}

export async function applyPenalty(reason: string): Promise<{ success: boolean; error?: string }> {
  return await processCreditsMovement(
    'penalizacion',
    -10,
    `Penalización: ${reason}`
  );
}
