
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CreditMovement {
  id: string;
  usuario_id: string;
  tipo: string;
  cantidad: number;
  descripcion: string;
  fecha: string;
  usuario?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface ChartData {
  fecha: string;
  compras: number;
  pujas: number;
  penalizaciones: number;
}

const CreditsManagement = () => {
  const [movements, setMovements] = useState<CreditMovement[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingCredit, setIsAddingCredit] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditDescription, setCreditDescription] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load credit movements
      const { data: movementsData, error: movementsError } = await supabase
        .from('movimientos_credito')
        .select(`
          *,
          usuario:usuario_id(first_name, last_name, email)
        `)
        .order('fecha', { ascending: false })
        .limit(100);

      if (movementsError) {
        console.error('Error loading movements:', movementsError);
        toast.error('Error al cargar movimientos');
        return;
      }

      setMovements(movementsData || []);

      // Load users for credit assignment
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, saldo_creditos')
        .order('first_name');

      if (usersError) {
        console.error('Error loading users:', usersError);
      } else {
        setUsers(usersData || []);
      }

      // Prepare chart data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const chartMovements = movementsData?.filter(m => 
        new Date(m.fecha) >= thirtyDaysAgo
      ) || [];

      // Group by date and type
      const groupedData: Record<string, ChartData> = {};
      
      chartMovements.forEach(movement => {
        const date = new Date(movement.fecha).toLocaleDateString('es-ES');
        if (!groupedData[date]) {
          groupedData[date] = { fecha: date, compras: 0, pujas: 0, penalizaciones: 0 };
        }
        
        if (movement.tipo === 'compra') {
          groupedData[date].compras += movement.cantidad;
        } else if (movement.tipo === 'puja') {
          groupedData[date].pujas += Math.abs(movement.cantidad);
        } else if (movement.tipo === 'penalizacion') {
          groupedData[date].penalizaciones += Math.abs(movement.cantidad);
        }
      });

      setChartData(Object.values(groupedData).sort((a, b) => 
        new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      ));

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const addCredits = async () => {
    if (!selectedUserId || !creditAmount || !creditDescription) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('La cantidad debe ser un número positivo');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('procesar_movimiento_credito', {
        p_usuario_id: selectedUserId,
        p_tipo: 'administracion',
        p_cantidad: amount,
        p_descripcion: creditDescription
      });

      if (error) {
        console.error('Error adding credits:', error);
        toast.error('Error al agregar créditos');
        return;
      }

      if (data && !data.success) {
        toast.error(data.error || 'Error al procesar créditos');
        return;
      }

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_admin_action', {
          p_admin_id: user.id,
          p_accion: 'agregar_creditos',
          p_detalle: `Agregó ${amount} créditos: ${creditDescription}`,
          p_tabla_afectada: 'movimientos_credito',
          p_registro_afectado_id: selectedUserId
        });
      }

      toast.success('Créditos agregados correctamente');
      setIsAddingCredit(false);
      setSelectedUserId('');
      setCreditAmount('');
      setCreditDescription('');
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    }
  };

  const filteredMovements = movements.filter(movement => 
    filterType === 'all' || movement.tipo === filterType
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'compra':
        return 'text-green-600';
      case 'puja':
        return 'text-blue-600';
      case 'penalizacion':
        return 'text-red-600';
      case 'administracion':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Créditos</h1>
        <div className="flex gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="compra">Compras</SelectItem>
              <SelectItem value="puja">Pujas</SelectItem>
              <SelectItem value="penalizacion">Penalizaciones</SelectItem>
              <SelectItem value="administracion">Administración</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddingCredit} onOpenChange={setIsAddingCredit}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Créditos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Créditos a Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user">Usuario</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Cantidad de Créditos</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Ingrese cantidad"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={creditDescription}
                    onChange={(e) => setCreditDescription(e.target.value)}
                    placeholder="Motivo del ajuste"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={addCredits} className="flex-1">
                    Agregar Créditos
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingCredit(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={loadData} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Actividad de Créditos (Últimos 30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="compras" stroke="#10b981" strokeWidth={2} name="Compras" />
                <Line type="monotone" dataKey="pujas" stroke="#3b82f6" strokeWidth={2} name="Pujas" />
                <Line type="monotone" dataKey="penalizaciones" stroke="#ef4444" strokeWidth={2} name="Penalizaciones" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      {loading ? (
        <div className="text-center py-8">Cargando movimientos...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Movimientos de Créditos ({filteredMovements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {movement.usuario ? 
                        `${movement.usuario.first_name} ${movement.usuario.last_name}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell className={getTypeColor(movement.tipo)}>
                      {movement.tipo}
                    </TableCell>
                    <TableCell className={movement.cantidad > 0 ? 'text-green-600' : 'text-red-600'}>
                      {movement.cantidad > 0 ? '+' : ''}{movement.cantidad}
                    </TableCell>
                    <TableCell>{movement.descripcion}</TableCell>
                    <TableCell>
                      {new Date(movement.fecha).toLocaleString('es-ES')}
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

export default CreditsManagement;
