
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Eye, UserX, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Report {
  id: string;
  tipo: string;
  detalle: string;
  estado: string;
  fecha: string;
  usuario_reportado?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  usuario_que_reporta?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const ReportsManagement = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const { data: reportsData, error } = await supabase
        .from('reportes')
        .select(`
          *,
          usuario_reportado:usuario_reportado_id(first_name, last_name, email),
          usuario_que_reporta:usuario_que_reporta_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reports:', error);
        toast.error('Error al cargar reportes');
        return;
      }

      setReports(reportsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reportes')
        .update({ estado: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) {
        console.error('Error updating report:', error);
        toast.error('Error al actualizar reporte');
        return;
      }

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_admin_action', {
          p_admin_id: user.id,
          p_accion: 'actualizar_reporte',
          p_detalle: `Cambió estado a: ${newStatus}`,
          p_tabla_afectada: 'reportes',
          p_registro_afectado_id: reportId
        });
      }

      toast.success('Estado actualizado correctamente');
      loadReports();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    }
  };

  const blockUser = async (userId: string, userName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ blocked: true })
        .eq('id', userId);

      if (error) {
        console.error('Error blocking user:', error);
        toast.error('Error al bloquear usuario');
        return;
      }

      // Log admin action
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_admin_action', {
          p_admin_id: user.id,
          p_accion: 'bloquear_usuario',
          p_detalle: `Bloqueó al usuario: ${userName}`,
          p_tabla_afectada: 'profiles',
          p_registro_afectado_id: userId
        });
      }

      toast.success(`Usuario ${userName} bloqueado correctamente`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error inesperado');
    }
  };

  const filteredReports = reports.filter(report => 
    filterStatus === 'all' || report.estado === filterStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="destructive">Pendiente</Badge>;
      case 'revisado':
        return <Badge variant="secondary">Revisado</Badge>;
      case 'cerrado':
        return <Badge variant="default">Cerrado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Reportes</h1>
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="revisado">Revisados</SelectItem>
              <SelectItem value="cerrado">Cerrados</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadReports} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando reportes...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Reportes ({filteredReports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Usuario Reportado</TableHead>
                  <TableHead>Reportado por</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.tipo}</TableCell>
                    <TableCell>
                      {report.usuario_reportado ? 
                        `${report.usuario_reportado.first_name} ${report.usuario_reportado.last_name}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {report.usuario_que_reporta ? 
                        `${report.usuario_que_reporta.first_name} ${report.usuario_que_reporta.last_name}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{report.detalle}</TableCell>
                    <TableCell>{getStatusBadge(report.estado)}</TableCell>
                    <TableCell>
                      {new Date(report.fecha).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {report.estado === 'pendiente' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateReportStatus(report.id, 'revisado')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {report.usuario_reportado && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => blockUser(
                              report.usuario_reportado_id!, 
                              `${report.usuario_reportado.first_name} ${report.usuario_reportado.last_name}`
                            )}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4">
            <CardHeader>
              <CardTitle>Detalle del Reporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Tipo:</strong> {selectedReport.tipo}
              </div>
              <div>
                <strong>Estado:</strong> {getStatusBadge(selectedReport.estado)}
              </div>
              <div>
                <strong>Fecha:</strong> {new Date(selectedReport.fecha).toLocaleString('es-ES')}
              </div>
              {selectedReport.usuario_reportado && (
                <div>
                  <strong>Usuario Reportado:</strong> {selectedReport.usuario_reportado.first_name} {selectedReport.usuario_reportado.last_name} ({selectedReport.usuario_reportado.email})
                </div>
              )}
              {selectedReport.usuario_que_reporta && (
                <div>
                  <strong>Reportado por:</strong> {selectedReport.usuario_que_reporta.first_name} {selectedReport.usuario_que_reporta.last_name} ({selectedReport.usuario_que_reporta.email})
                </div>
              )}
              <div>
                <strong>Detalle:</strong>
                <p className="mt-2 p-3 bg-gray-50 rounded">{selectedReport.detalle}</p>
              </div>
              <div className="flex gap-2 pt-4">
                {selectedReport.estado === 'pendiente' && (
                  <Button onClick={() => {
                    updateReportStatus(selectedReport.id, 'revisado');
                    setSelectedReport(null);
                  }}>
                    Marcar como Revisado
                  </Button>
                )}
                <Button onClick={() => {
                  updateReportStatus(selectedReport.id, 'cerrado');
                  setSelectedReport(null);
                }}>
                  Cerrar Reporte
                </Button>
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
