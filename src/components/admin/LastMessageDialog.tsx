
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { UserLastNotification } from '@/services/admin/notificationService';

interface LastMessageDialogProps {
  notification: UserLastNotification;
  userName: string;
}

const LastMessageDialog: React.FC<LastMessageDialogProps> = ({ notification, userName }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="mr-1 h-4 w-4" />
          Ver mensaje
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Último mensaje enviado</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Para: {userName}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
            </div>
            <Badge variant={notification.is_read ? "default" : "secondary"}>
              {notification.is_read ? "Leído" : "No leído"}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">{notification.title}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LastMessageDialog;
