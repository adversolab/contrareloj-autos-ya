
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createNotification } from '@/services/notificationService';
import { getMessageTemplates, MessageTemplate } from '@/services/messageTemplateService';
import { Send } from 'lucide-react';

interface SendMessageDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
  onMessageSent?: () => void;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({ 
  userId, 
  userName, 
  userEmail, 
  onMessageSent 
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const data = await getMessageTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Error al cargar plantillas');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTitle(template.titulo);
      setMessage(template.contenido);
    }
  };

  const handleSendMessage = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      console.log('SendMessageDialog: Sending message to user:', { userId, title, message });
      const success = await createNotification(userId, title, message, 'admin');
      
      if (success) {
        toast.success('Mensaje enviado y registrado correctamente');
        setTitle('');
        setMessage('');
        setOpen(false);
        
        // Call the callback to refresh parent components with a longer delay
        if (onMessageSent) {
          console.log('SendMessageDialog: Calling onMessageSent callback to refresh UI');
          // Wait longer to ensure the database has been updated
          setTimeout(() => {
            onMessageSent();
          }, 1500); // Increased from 1000ms to 1500ms
        }
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
            <Label htmlFor="template-select">Plantillas de mensaje</Label>
            {loadingTemplates ? (
              <div className="text-sm text-muted-foreground">Cargando plantillas...</div>
            ) : (
              <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
