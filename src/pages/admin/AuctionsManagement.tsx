
import React from 'react';
import { Button } from '@/components/ui/button';
import AuctionsTable from '@/components/admin/auctions/AuctionsTable';
import DeleteAuctionDialog from '@/components/admin/auctions/DeleteAuctionDialog';
import { useAuctionsManagement } from '@/hooks/useAuctionsManagement';

const AuctionsManagement: React.FC = () => {
  const {
    auctions,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    fetchAuctions,
    handleApproveAuction,
    handlePauseAuction,
    openDeleteDialog,
    handleDeleteAuction,
    handleCancelDelete
  } = useAuctionsManagement();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Subastas</h1>
        <Button onClick={fetchAuctions} variant="outline">
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando subastas...</div>
      ) : (
        <AuctionsTable 
          auctions={auctions}
          onApprove={handleApproveAuction}
          onPause={handlePauseAuction}
          onOpenDeleteDialog={openDeleteDialog}
        />
      )}

      <DeleteAuctionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onCancel={handleCancelDelete}
        onConfirm={handleDeleteAuction}
      />
    </div>
  );
};

export default AuctionsManagement;
