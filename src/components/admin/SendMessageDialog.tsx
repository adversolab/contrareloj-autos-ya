
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createNotification } from '@/services/notificationService';
import { Send } from 'lucide-react';

interface SendMessageDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
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

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({ userId, userName, userEmail }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePredefinedMessage = (messageId: string) => {
    const predefined = predefinedMessages.find(msg => msg.id === messageId);
    if (predefined) {
      setTitle(predefined.title);
      setMessage(predefined.message);
    }
  };

  const handleSendMessage = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const success = await createNotification(userId, title, message, 'admin');
      
      if (success) {
        toast.success('Mensaje enviado correctamente');
        setTitle('');
        setMessage('');
        setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Send className="mr-1 h-4 w-4" />
          Enviar mensaje
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar Mensaje</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Para: {userName} ({userEmail})
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="dialog-title">Título</Label>
            <Input
              id="dialog-title"
              placeholder="Título del mensaje"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialog-message">Mensaje</Label>
            <Textarea
              id="dialog-message"
              placeholder="Escribe el mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleSendMessage}
            disabled={loading || !title.trim() || !message.trim()}
            className="w-full"
          >
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageDialog;
