
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/services/authService';
import { toast } from 'sonner';
import { Search, Mail, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SentMessage {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
  type: string;
  sent_by: string;
  user_email?: string;
  user_first_name?: string | null;
  user_last_name?: string | null;
}

const SentMessagesSection: React.FC = () => {
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<SentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError('Usuario no autenticado');
        toast.error('Error: Usuario no autenticado');
        return;
      }

      console.log('SentMessagesSection: Fetching messages for admin:', currentUser.id);
      
      // Direct Supabase query - no dependency on Lovable endpoints
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at, is_read, user_id, type, sent_by')
        .eq('type', 'admin')
        .eq('sent_by', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('SentMessagesSection: Supabase error:', error);
        setError('Error al cargar mensajes desde la base de datos');
        toast.error('Error al cargar mensajes enviados');
        return;
      }

      console.log('SentMessagesSection: Successfully fetched', data?.length || 0, 'messages');

      if (!data || data.length === 0) {
        console.log('SentMessagesSection: No messages found for current admin');
        setSentMessages([]);
        setFilteredMessages([]);
        return;
      }

      // Fetch user details for each message
      const messagesWithUserData = await Promise.all(
        data.map(async (notification) => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', notification.user_id)
              .single();

            if (profileError) {
              console.error('SentMessagesSection: Error fetching profile for user:', notification.user_id, profileError);
            }

            return {
              ...notification,
              user_email: profile?.email || 'Email no encontrado',
              user_first_name: profile?.first_name || null,
              user_last_name: profile?.last_name || null,
            };
          } catch (profileError) {
            console.error('SentMessagesSection: Profile fetch error for user:', notification.user_id, profileError);
            return {
              ...notification,
              user_email: 'Error al cargar email',
              user_first_name: null,
              user_last_name: null,
            };
          }
        })
      );

      console.log('SentMessagesSection: Messages with user data loaded successfully');
      setSentMessages(messagesWithUserData);
      setFilteredMessages(messagesWithUserData);
    } catch (error) {
      console.error('SentMessagesSection: Unexpected error:', error);
      setError('Error inesperado al cargar mensajes');
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Mis Mensajes Enviados
          </CardTitle>
          <Button onClick={fetchSentMessages} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
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
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}
        
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
            {searchTerm ? 'No se encontraron mensajes que coincidan con la búsqueda' : 'No has enviado mensajes aún'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentMessagesSection;
