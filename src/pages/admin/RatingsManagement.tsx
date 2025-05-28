
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Rating {
  id: string;
  puntuacion: number;
  comentario?: string;
  fecha: string;
  visible: boolean;
  evaluador?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  evaluado?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const RatingsManagement = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      
      const { data: ratingsData, error } = await supabase
        .from('valoraciones_usuario')
        .select(`
          *,
          evaluador:evaluador_id(first_name, last_name, email),
          evaluado:evaluado_id(first_name, last_name, email)
        `)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error loading ratings:', error);
        toast.error('Error al cargar valoraciones');
        return;
      }

      setRatings(ratingsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (ratingId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('valoraciones_usuario')
        .update({ visible: !currentVisibility })
        .eq('id', ratingId);

      if (error) {
        console.error('Error updating visibility:', error);
        toast.error('Error al actualizar visibilidad');
        return;
      }

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_admin_action', {
          p_admin_id: user.id,
          p_accion: 'cambiar_visibilidad_valoracion',
          p_detalle: `Cambió visibilidad a: ${!currentVisibility}`,
          p_tabla_afectada: 'valoraciones_usuario',
          p_registro_afectado_id: ratingId
        });
      }

      toast.success(currentVisibility ? 'Valoración ocultada' : 'Valoración visible');
      loadRatings();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    }
  };

  const deleteRating = async (ratingId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta valoración?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('valoraciones_usuario')
        .delete()
        .eq('id', ratingId);

      if (error) {
        console.error('Error deleting rating:', error);
        toast.error('Error al eliminar valoración');
        return;
      }

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_admin_action', {
          p_admin_id: user.id,
          p_accion: 'eliminar_valoracion',
          p_detalle: 'Eliminó valoración',
          p_tabla_afectada: 'valoraciones_usuario',
          p_registro_afectado_id: ratingId
        });
      }

      toast.success('Valoración eliminada correctamente');
      loadRatings();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Valoraciones</h1>
        <Button onClick={loadRatings} variant="outline">
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando valoraciones...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Valoraciones ({ratings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evaluador</TableHead>
                  <TableHead>Evaluado</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ratings.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell>
                      {rating.evaluador ? 
                        `${rating.evaluador.first_name} ${rating.evaluador.last_name}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {rating.evaluado ? 
                        `${rating.evaluado.first_name} ${rating.evaluado.last_name}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(rating.puntuacion)}
                        </div>
                        <span>{rating.puntuacion}/5</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {rating.comentario ? (
                        <div className="truncate" title={rating.comentario}>
                          {rating.comentario}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin comentario</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(rating.fecha).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {rating.visible ? (
                        <Badge variant="default">Visible</Badge>
                      ) : (
                        <Badge variant="secondary">Oculta</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleVisibility(rating.id, rating.visible)}
                        >
                          {rating.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteRating(rating.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RatingsManagement;
