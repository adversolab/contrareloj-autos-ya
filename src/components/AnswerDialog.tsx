
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { answerQuestion } from '@/services/vehicleService';

interface AnswerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onAnswerSubmitted: () => void;
}

const AnswerDialog: React.FC<AnswerDialogProps> = ({ isOpen, onClose, questionId, onAnswerSubmitted }) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { success } = await answerQuestion(questionId, answer);
      if (success) {
        setAnswer('');
        onAnswerSubmitted();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Responder pregunta</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Escribe tu respuesta..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-contrareloj hover:bg-contrareloj-dark"
            disabled={isSubmitting || !answer.trim()}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnswerDialog;
