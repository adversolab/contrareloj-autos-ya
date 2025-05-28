
import { supabase } from '@/integrations/supabase/client';

export interface MessageTemplate {
  id: string;
  titulo: string;
  contenido: string;
  categoria?: string;
  creado_por: string;
  fecha_creacion: string;
}

export const getMessageTemplates = async (): Promise<MessageTemplate[]> => {
  const { data, error } = await supabase
    .from('mensajes_template')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) {
    console.error('Error fetching message templates:', error);
    throw error;
  }

  return data || [];
};

export const createMessageTemplate = async (
  titulo: string,
  contenido: string,
  categoria?: string
): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('Usuario no autenticado');
  }

  const { error } = await supabase
    .from('mensajes_template')
    .insert([{
      titulo,
      contenido,
      categoria,
      creado_por: user.user.id
    }]);

  if (error) {
    console.error('Error creating message template:', error);
    throw error;
  }

  return true;
};

export const updateMessageTemplate = async (
  id: string,
  titulo: string,
  contenido: string,
  categoria?: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('mensajes_template')
    .update({
      titulo,
      contenido,
      categoria
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating message template:', error);
    throw error;
  }

  return true;
};

export const deleteMessageTemplate = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('mensajes_template')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting message template:', error);
    throw error;
  }

  return true;
};
