
import { supabase } from '@/integrations/supabase/client';

export interface PublicationService {
  id: string;
  servicio: string;
  costo_creditos: number;
  descripcion: string;
  activo: boolean;
}

export async function getPublicationServices(): Promise<{ services: PublicationService[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('servicios_publicacion')
      .select('*')
      .eq('activo', true)
      .order('servicio');

    if (error) {
      console.error('Error fetching publication services:', error);
      return { services: [], error: 'Error al obtener los costos de publicación' };
    }

    return { services: data || [] };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { services: [], error: 'Error inesperado' };
  }
}

export function getServiceCost(services: PublicationService[], serviceName: string): number {
  const service = services.find(s => s.servicio === serviceName);
  return service ? service.costo_creditos : 0;
}
