
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserRating } from './types';

interface UserRatingsSectionProps {
  userId: string;
  averageRating?: number;
}

const UserRatingsSection: React.FC<UserRatingsSectionProps> = ({
  userId,
  averageRating = 0
}) => {
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserRatings();
  }, [userId]);

  const loadUserRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('valoraciones_usuario')
        .select(`
          *,
          evaluador:profiles!valoraciones_usuario_evaluador_id_fkey(first_name, last_name),
          remate:auctions!valoraciones_usuario_remate_id_fkey(
            vehicle:vehicles(brand, model, year)
          )
        `)
        .eq('evaluado_id', userId)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error al cargar valoraciones:', error);
        return;
      }

      setRatings(data || []);
    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => {
      const isFilled = index < rating;
      return (
        <Star
          key={index}
          className={`w-4 h-4 ${
            isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Cargando valoraciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          Valoraciones Recibidas
        </CardTitle>
        {ratings.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">
              ({ratings.length} {ratings.length === 1 ? 'valoración' : 'valoraciones'})
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {ratings.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Este usuario aún no ha recibido valoraciones
          </p>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {renderStars(rating.puntuacion)}
                      </div>
                      <span className="font-medium">
                        {rating.evaluador?.first_name} {rating.evaluador?.last_name}
                      </span>
                    </div>
                    {rating.remate?.vehicle && (
                      <p className="text-sm text-gray-600">
                        Subasta: {rating.remate.vehicle.brand} {rating.remate.vehicle.model} {rating.remate.vehicle.year}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(rating.fecha)}
                  </span>
                </div>
                {rating.comentario && (
                  <p className="text-gray-700 text-sm mt-2">
                    "{rating.comentario}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRatingsSection;
