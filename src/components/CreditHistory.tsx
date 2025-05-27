
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { getCreditMovements, CreditMovement } from '@/services/creditService';
import { formatCurrency } from '@/utils/formatters';

const CreditHistory = () => {
  const [movements, setMovements] = useState<CreditMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMovements = async () => {
      setIsLoading(true);
      const { movements: userMovements } = await getCreditMovements();
      setMovements(userMovements);
      setIsLoading(false);
    };

    loadMovements();
  }, []);

  const getMovementIcon = (tipo: CreditMovement['tipo']) => {
    switch (tipo) {
      case 'compra':
      case 'bono':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'puja':
      case 'penalizacion':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMovementColor = (cantidad: number) => {
    return cantidad > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getMovementBadge = (tipo: CreditMovement['tipo']) => {
    const badges = {
      compra: { label: 'Compra', color: 'bg-green-500' },
      puja: { label: 'Puja', color: 'bg-blue-500' },
      publicacion: { label: 'Publicación', color: 'bg-purple-500' },
      destacar: { label: 'Destacar', color: 'bg-yellow-500' },
      renovacion: { label: 'Renovación', color: 'bg-orange-500' },
      penalizacion: { label: 'Penalización', color: 'bg-red-500' },
      bono: { label: 'Bono', color: 'bg-green-500' }
    };

    const badge = badges[tipo];
    return (
      <Badge className={`${badge.color} text-white text-xs`}>
        {badge.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Historial de créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p>Cargando historial...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Historial de créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tienes movimientos de créditos aún</p>
            <p className="text-sm text-gray-400 mt-1">
              Compra tu primer pack de créditos para comenzar a participar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Historial de créditos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.map((movement) => (
            <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getMovementIcon(movement.tipo)}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {getMovementBadge(movement.tipo)}
                    <span className="text-sm text-gray-500">
                      {formatDate(movement.fecha)}
                    </span>
                  </div>
                  <p className="font-medium">{movement.descripcion}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${getMovementColor(movement.cantidad)}`}>
                  {movement.cantidad > 0 ? '+' : ''}{movement.cantidad} créditos
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreditHistory;
