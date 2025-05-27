
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UserRatingFormProps {
  auctionId: string;
  evaluatedUserId: string;
  evaluatedUserName: string;
  vehicleInfo: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

const UserRatingForm: React.FC<UserRatingFormProps> = ({
  auctionId,
  evaluatedUserId,
  evaluatedUserName,
  vehicleInfo,
  onSubmitted,
  onCancel
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue: number) => {
    setHoveredRating(starValue);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Debes seleccionar una calificación');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Debes estar autenticado');
        return;
      }

      // Verificar si ya existe una valoración
      const { data: existingRating } = await supabase
        .from('valoraciones_usuario')
        .select('id')
        .eq('evaluador_id', user.id)
        .eq('remate_id', auctionId)
        .single();

      if (existingRating) {
        toast.error('Ya has evaluado este remate');
        return;
      }

      // Crear la valoración
      const { error } = await supabase
        .from('valoraciones_usuario')
        .insert({
          evaluador_id: user.id,
          evaluado_id: evaluatedUserId,
          remate_id: auctionId,
          puntuacion: rating,
          comentario: comment.trim() || null
        });

      if (error) {
        console.error('Error al crear valoración:', error);
        toast.error('Error al enviar la evaluación');
        return;
      }

      // Recalcular promedio del usuario evaluado
      await recalculateUserRating(evaluatedUserId);
      
      toast.success('Evaluación enviada correctamente');
      onSubmitted();
    } catch (error) {
      console.error('Error inesperado:', error);
      toast.error('Error al procesar la evaluación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const recalculateUserRating = async (userId: string) => {
    try {
      // Obtener todas las valoraciones del usuario
      const { data: ratings } = await supabase
        .from('valoraciones_usuario')
        .select('puntuacion')
        .eq('evaluado_id', userId);

      if (ratings && ratings.length > 0) {
        const average = ratings.reduce((sum, r) => sum + r.puntuacion, 0) / ratings.length;
        
        // Actualizar el promedio en el perfil
        await supabase
          .from('profiles')
          .update({ valoracion_promedio: Math.round(average * 10) / 10 })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error al recalcular promedio:', error);
    }
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <Star
          key={index}
          className={`w-8 h-8 cursor-pointer transition-colors ${
            isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
          }`}
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          onMouseLeave={handleStarLeave}
        />
      );
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Evaluar Usuario</CardTitle>
        <p className="text-sm text-gray-600">
          Evalúa tu experiencia con {evaluatedUserName} en la subasta de {vehicleInfo}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Calificación</label>
          <div className="flex gap-1">
            {renderStars()}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating} de 5 estrellas
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Comentario (opcional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia..."
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Evaluación'}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRatingForm;
