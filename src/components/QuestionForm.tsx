
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { submitQuestion } from '@/services/vehicleService';

interface QuestionFormProps {
  auctionId: string;
  onQuestionSubmitted: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ auctionId, onQuestionSubmitted }) => {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { success } = await submitQuestion(auctionId, question);
      if (success) {
        setQuestion('');
        onQuestionSubmitted();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Hacer una pregunta</h3>
      <Textarea
        placeholder="Escribe tu pregunta sobre este vehículo..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="bg-contrareloj hover:bg-contrareloj-dark"
          disabled={isSubmitting || !question.trim()}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar pregunta'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
