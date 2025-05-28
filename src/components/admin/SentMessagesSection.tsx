
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SentMessage {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
  type: string;
  user_email?: string;
  user_first_name?: string | null;
  user_last_name?: string | null;
}

const SentMessagesSection: React.FC = () => {
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSentMessages();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sentMessages.filter(message => 
        (message.user_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (message.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (`${message.user_first_name || ''} ${message.user_last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(sentMessages);
    }
  }, [searchTerm, sentMessages]);

  const fetchSentMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          message,
          created_at,
          is_read,
          user_id,
          type
        `)
        .eq('type', 'admin')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent messages:', error);
        toast.error('Error al cargar mensajes enviados');
        return;
      }

      // Fetch user details for each message
      const messagesWithUserData = await Promise.all(
        (data || []).map(async (notification) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', notification.user_id)
            .single();

          return {
            ...notification,
            user_email: profile?.email || '',
            user_first_name: profile?.first_name || null,
            user_last_name: profile?.last_name || null,
          };
        })
      );

      setSentMessages(messagesWithUserData);
      setFilteredMessages(messagesWithUserData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar mensajes enviados');
    } finally {
      setLoading(false);
    }
  };

  const getMessageDisplayName = (message: SentMessage) => {
    const name = `${message.user_first_name || ''} ${message.user_last_name || ''}`.trim();
    return name || message.user_email || 'Usuario desconocido';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Mensajes Enviados
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por destinatario, título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Cargando mensajes enviados...</div>
        ) : filteredMessages.length > 0 ? (
          <div className="space-y-4">
            {filteredMessages.map((sentMessage) => (
              <div key={sentMessage.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{sentMessage.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Para: {getMessageDisplayName(sentMessage)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={sentMessage.is_read ? "default" : "secondary"}>
                      {sentMessage.is_read ? "Leído" : "No leído"}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {format(new Date(sentMessage.created_at), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{sentMessage.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No se encontraron mensajes que coincidan con la búsqueda' : 'No se han enviado mensajes aún'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentMessagesSection;
