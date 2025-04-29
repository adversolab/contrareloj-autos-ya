import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { answerQuestion } from '@/services/vehicleService';

interface AnswerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: string;
  onAnswerSubmitted?: () => void;
  onSubmit?: () => Promise<void>; // Added to match usage in AuctionDetail
  answerText?: string; // Added to match usage in AuctionDetail
}

const AnswerDialog: React.FC<AnswerDialogProps> = ({ 
  isOpen, 
  onClose, 
  questionId = '', 
  onAnswerSubmitted = () => {}, 
  onSubmit,
  answerText: externalAnswerText
}) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use provided external state if available, otherwise use internal state
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };

  const handleSubmit = async () => {
    // If external submit handler is provided, use it
    if (onSubmit) {
      await onSubmit();
      return;
    }
    
    // Otherwise use internal submit logic
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
            value={externalAnswerText !== undefined ? externalAnswerText : answer}
            onChange={externalAnswerText !== undefined ? undefined : handleAnswerChange}
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
            disabled={isSubmitting || (!externalAnswerText && !answer.trim())}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar respuesta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnswerDialog;
