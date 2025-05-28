
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createNotification } from '@/services/notificationService';
import { Send, Search, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface SentMessage {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  user_id: string;
  type: string;
  user?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

const MessagesManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [loadingSentMessages, setLoadingSentMessages] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchSentMessages();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .order('email');

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Error al cargar usuarios');
        return;
      }

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchSentMessages = async () => {
    setLoadingSentMessages(true);
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
          type,
          user:profiles!user_id(email, first_name, last_name)
        `)
        .eq('type', 'admin')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent messages:', error);
        toast.error('Error al cargar mensajes enviados');
        return;
      }

      setSentMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar mensajes enviados');
    } finally {
      setLoadingSentMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUserId || !title.trim() || !message.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const success = await createNotification(selectedUserId, title, message, 'admin');
      
      if (success) {
        toast.success('Mensaje enviado correctamente');
        // Reset form
        setSelectedUserId('');
        setTitle('');
        setMessage('');
        setSearchTerm('');
        // Refresh sent messages
        fetchSentMessages();
      } else {
        toast.error('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (user: User) => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return name || user.email;
  };

  const getMessageDisplayName = (message: SentMessage) => {
    if (message.user) {
      const name = `${message.user.first_name || ''} ${message.user.last_name || ''}`.trim();
      return name || message.user.email;
    }
    return 'Usuario desconocido';
  };

  if (loadingUsers) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Mensajes</h1>
        <div className="text-center py-8">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Mensajes</h1>
      
      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Enviar Mensaje</TabsTrigger>
          <TabsTrigger value="sent">Mensajes Enviados</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Mensaje a Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Búsqueda y selección de usuario */}
              <div className="space-y-2">
                <Label htmlFor="user-search">Buscar Usuario</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="user-search"
                    placeholder="Buscar por email o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-select">Seleccionar Usuario</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{getDisplayName(user)}</span>
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campos del mensaje */}
              <div className="space-y-2">
                <Label htmlFor="title">Título del Mensaje</Label>
                <Input
                  id="title"
                  placeholder="Título del mensaje"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  placeholder="Escribe el mensaje aquí..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Botón de envío */}
              <Button 
                onClick={handleSendMessage} 
                disabled={loading || !selectedUserId || !title.trim() || !message.trim()}
                className="w-full"
              >
                {loading ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Mensajes Enviados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSentMessages ? (
                <div className="text-center py-8">Cargando mensajes enviados...</div>
              ) : sentMessages.length > 0 ? (
                <div className="space-y-4">
                  {sentMessages.map((sentMessage) => (
                    <div key={sentMessage.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{sentMessage.title}</h3>
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
                      <p className="text-sm">{sentMessage.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No se han enviado mensajes aún
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagesManagement;
