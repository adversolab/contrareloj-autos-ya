import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createNotification } from '@/services/notificationService';
import { Send, Search } from 'lucide-react';
import SentMessagesSection from '@/components/admin/SentMessagesSection';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface PredefinedMessage {
  id: string;
  title: string;
  message: string;
}

const predefinedMessages: PredefinedMessage[] = [
  {
    id: 'falta_cedula',
    title: 'Falta de documentos para verificación',
    message: 'Hola, bienvenido a Contrareloj. Hemos detectado que falta adjuntar la cédula de identidad por ambos lados. Por favor, sube las imágenes de tu cédula (frente y reverso) en tu perfil para completar la verificación.'
  },
  {
    id: 'fotos_borrosas',
    title: 'Problemas con calidad de imágenes',
    message: 'Las imágenes adjuntadas están borrosas o poco legibles. Por favor vuelve a subirlas con mejor resolución y asegúrate de que todos los datos sean claramente visibles.'
  },
  {
    id: 'documentos_incompletos',
    title: 'Documentación incompleta',
    message: 'Parte de la información requerida está incompleta. Revisa los campos solicitados en tu perfil y actualízalos para completar el proceso de verificación.'
  },
  {
    id: 'rechazo_verificacion',
    title: 'Rechazo de verificación',
    message: 'No se ha podido verificar tu identidad con los documentos enviados. Por favor revisa que la información coincida exactamente con tus documentos oficiales y vuelve a intentar.'
  }
];

const MessagesManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
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

  const handlePredefinedMessage = (messageId: string) => {
    const predefined = predefinedMessages.find(msg => msg.id === messageId);
    if (predefined) {
      setTitle(predefined.title);
      setMessage(predefined.message);
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

              {/* Mensajes predefinidos */}
              <div className="space-y-2">
                <Label htmlFor="predefined-select">Mensajes predefinidos</Label>
                <Select onValueChange={handlePredefinedMessage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="falta_cedula">Falta cédula de identidad</SelectItem>
                    <SelectItem value="fotos_borrosas">Fotos borrosas</SelectItem>
                    <SelectItem value="documentos_incompletos">Documentación incompleta</SelectItem>
                    <SelectItem value="rechazo_verificacion">Rechazo de verificación</SelectItem>
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
          <SentMessagesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagesManagement;
