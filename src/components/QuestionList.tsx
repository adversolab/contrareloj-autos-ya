
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Question {
  id: string;
  question: string;
  answer: string | null;
  is_answered: boolean;
  created_at: string;
  answered_at: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null; // Mark profiles as potentially null
}

interface QuestionListProps {
  questions: Question[];
  isOwner: boolean;
  onAnswer: (questionId: string) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, isOwner, onAnswer }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };

  if (questions.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <h3 className="text-lg font-medium mb-2">Preguntas y respuestas</h3>
        <p className="text-gray-500">Todavía no hay preguntas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Preguntas y respuestas ({questions.length})</h3>
      
      {questions.map((question) => (
        <div key={question.id} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">
                {/* Add null checks for profiles object */}
                {question.profiles?.first_name || 'Usuario'} {question.profiles?.last_name || ''}
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  • {formatDate(question.created_at)}
                </span>
              </p>
              <p className="mt-1">{question.question}</p>
            </div>
            {isOwner && !question.is_answered && (
              <button 
                onClick={() => onAnswer(question.id)}
                className="bg-contrareloj text-white px-3 py-1 rounded text-sm hover:bg-contrareloj-dark"
              >
                Responder
              </button>
            )}
          </div>
          
          {question.is_answered && question.answer && (
            <div className="pl-4 border-l-2 border-gray-200 mt-3 ml-2">
              <p className="text-sm text-gray-500">
                Respuesta <span className="text-xs">• {question.answered_at ? formatDate(question.answered_at) : ''}</span>
              </p>
              <p className="mt-1">{question.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
