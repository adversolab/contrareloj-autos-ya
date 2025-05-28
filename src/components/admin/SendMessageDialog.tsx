
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createNotification } from '@/services/notificationService';
import { Send } from 'lucide-react';

interface SendMessageDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
}

const SendMessageDialog: React.FC<SendMessageDialogProps> = ({ userId, userName, userEmail }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
              rows={3}
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
