
import React from 'react';

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  user_id: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

interface BidHistoryProps {
  bids: Bid[];
}

const BidHistory: React.FC<BidHistoryProps> = ({ bids }) => {
  if (bids.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <h3 className="text-lg font-medium mb-2">Historial de ofertas</h3>
        <p className="text-gray-500">Aún no hay ofertas para este vehículo.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Historial de ofertas</h3>
      
      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bids.map((bid) => {
              const bidderName = bid.profiles?.first_name 
                ? `${bid.profiles.first_name} ${bid.profiles.last_name || ''}`
                : 'Usuario';
              
              const bidDate = new Date(bid.created_at);
              
              let statusLabel = 'Activa';
              let statusClass = 'bg-blue-100 text-blue-800';
              
              if (bid.status === 'winning') {
                statusLabel = 'Ganadora';
                statusClass = 'bg-green-100 text-green-800';
              } else if (bid.status === 'lost') {
                statusLabel = 'No ganadora';
                statusClass = 'bg-gray-100 text-gray-800';
              }
              
              return (
                <tr key={bid.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bidderName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${bid.amount.toLocaleString('es-CL')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {bidDate.toLocaleDateString('es-CL', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}{' '}
                      {bidDate.toLocaleTimeString('es-CL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BidHistory;
