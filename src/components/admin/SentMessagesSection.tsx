
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/services/authService';
import { toast } from 'sonner';
import { Search, Mail, Clock, RefreshCw, AlertCircle, User } from 'lucide-react';
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
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

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
    setDebugInfo('Iniciando consulta...');
    
    try {
      console.log('SentMessagesSection: Starting fetchSentMessages...');
      
      const currentUser = await getCurrentUser();
      console.log('SentMessagesSection: Current user from auth:', currentUser);
      
      if (!currentUser) {
        const errorMsg = 'Usuario no autenticado';
        console.error('SentMessagesSection: No authenticated user');
        setError(errorMsg);
        setCurrentAdminId(null);
        setDebugInfo('Error: Usuario no autenticado');
        toast.error('Error: Usuario no autenticado');
        return;
      }

      const adminId = currentUser.id;
      console.log('SentMessagesSection: Admin ID to query:', adminId);
      setCurrentAdminId(adminId);
      setDebugInfo(`Consultando con admin ID: ${adminId}`);

      if (!adminId || adminId.trim() === '') {
        const errorMsg = 'ID de administrador no válido';
        console.error('SentMessagesSection: Invalid admin ID:', adminId);
        setError(errorMsg);
        setDebugInfo('Error: ID inválido');
        toast.error('Error: ID de administrador no válido');
        return;
      }

      console.log('SentMessagesSection: Querying notifications with sent_by =', adminId);
      
      // Direct Supabase query
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at, is_read, user_id, type, sent_by')
        .eq('type', 'admin')
        .eq('sent_by', adminId)
        .order('created_at', { ascending: false });

      console.log('SentMessagesSection: Supabase query result:', { 
        dataCount: data?.length || 0, 
        error,
        adminId,
        rawData: data
      });

      if (error) {
        console.error('SentMessagesSection: Supabase error:', error);
        setError('Error al cargar mensajes desde la base de datos');
        setDebugInfo(`Error Supabase: ${error.message}`);
        toast.error('Error al cargar mensajes enviados');
        return;
      }

      console.log('SentMessagesSection: Successfully fetched', data?.length || 0, 'messages');
      setDebugInfo(`Encontrados ${data?.length || 0} mensajes enviados`);

      if (!data || data.length === 0) {
        console.log('SentMessagesSection: No messages found for current admin');
        setSentMessages([]);
        setFilteredMessages([]);
        setDebugInfo('No se encontraron mensajes enviados por este admin');
        return;
      }

      // Fetch user details for each message
      console.log('SentMessagesSection: Fetching user details for messages...');
      setDebugInfo(`Cargando datos de ${data.length} usuarios...`);
      
      const messagesWithUserData = await Promise.all(
        data.map(async (notification) => {
          try {
            console.log('SentMessagesSection: Fetching profile for user_id:', notification.user_id);
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', notification.user_id)
              .single();

            if (profileError) {
              console.error('SentMessagesSection: Error fetching profile for user:', notification.user_id, profileError);
            }

            const result = {
              ...notification,
              user_email: profile?.email || 'Email no encontrado',
              user_first_name: profile?.first_name || null,
              user_last_name: profile?.last_name || null,
            };
            console.log('SentMessagesSection: Message with user data:', result);
            return result;
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

      console.log('SentMessagesSection: Final messages with user data:', messagesWithUserData);
      setSentMessages(messagesWithUserData);
      setFilteredMessages(messagesWithUserData);
      setDebugInfo(`Cargados ${messagesWithUserData.length} mensajes completamente`);
      
    } catch (error) {
      console.error('SentMessagesSection: Unexpected error:', error);
      setError('Error inesperado al cargar mensajes');
      setDebugInfo(`Error inesperado: ${error}`);
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
        
        {/* Debug info */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <User className="h-4 w-4 text-blue-600" />
          <div className="text-blue-800">
            <div>Admin: {currentAdminId ? currentAdminId : 'No identificado'}</div>
            <div>Estado: {debugInfo}</div>
            <div>Mensajes cargados: {sentMessages.length}</div>
          </div>
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

        {!currentAdminId && !loading && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800">No se pudo identificar al administrador actual</span>
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
            {searchTerm ? 'No se encontraron mensajes que coincidan con la búsqueda' : 
             currentAdminId ? 'No has enviado mensajes aún' : 'No se puede cargar mensajes sin identificar al admin'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentMessagesSection;
