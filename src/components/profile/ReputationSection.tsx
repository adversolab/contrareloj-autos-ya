
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertTriangle, Target, TrendingUp } from 'lucide-react';

interface ReputationSectionProps {
  subastas_ganadas: number;
  subastas_abandonadas: number;
  penalizaciones: number;
}

const ReputationSection: React.FC<ReputationSectionProps> = ({
  subastas_ganadas,
  subastas_abandonadas,
  penalizaciones
}) => {
  // Calcular tasa de éxito
  const totalSubastas = subastas_ganadas + subastas_abandonadas;
  const tasaExito = totalSubastas > 0 ? (subastas_ganadas / totalSubastas * 100) : 0;

  // Determinar el nivel de reputación basado en las métricas
  const getReputationLevel = () => {
    if (penalizaciones >= 5) return { level: 'Baja', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (subastas_abandonadas >= 3) return { level: 'Regular', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (subastas_ganadas >= 10 && penalizaciones === 0) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (subastas_ganadas >= 5) return { level: 'Buena', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { level: 'Nueva', color: 'text-gray-600', bgColor: 'bg-gray-50' };
  };

  const reputation = getReputationLevel();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Reputación del Usuario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Subastas Ganadas */}
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{subastas_ganadas}</p>
              <p className="text-sm text-green-600">Subastas Ganadas</p>
            </div>
          </div>

          {/* Subastas Abandonadas */}
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{subastas_abandonadas}</p>
              <p className="text-sm text-orange-600">Subastas Abandonadas</p>
            </div>
          </div>

          {/* Penalizaciones */}
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{penalizaciones}</p>
              <p className="text-sm text-red-600">Penalizaciones</p>
            </div>
          </div>

          {/* Tasa de Éxito */}
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{tasaExito.toFixed(1)}%</p>
              <p className="text-sm text-blue-600">Tasa de Éxito</p>
            </div>
          </div>
        </div>

        {/* Nivel de Reputación */}
        <div className={`p-4 rounded-lg ${reputation.bgColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Nivel de Reputación</h3>
              <p className={`text-2xl font-bold ${reputation.color}`}>{reputation.level}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {totalSubastas === 0 ? 'Sin actividad aún' : 
                 `${subastas_ganadas} de ${totalSubastas} subastas completadas`}
              </p>
            </div>
          </div>
        </div>

        {/* Consejos para mejorar reputación */}
        {(penalizaciones > 0 || subastas_abandonadas > 0) && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Consejos para mejorar tu reputación:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {subastas_abandonadas > 0 && (
                <li>• Concreta las compras de las subastas que ganes para evitar penalizaciones</li>
              )}
              {penalizaciones > 0 && (
                <li>• Las penalizaciones afectan tu reputación, mantén un buen comportamiento</li>
              )}
              <li>• Participa activamente y completa tus transacciones para construir confianza</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReputationSection;
