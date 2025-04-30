
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

  // Separate auctions by status
  const pendingAuctions = auctions.filter(auction => auction.status === 'pending_approval' && !auction.is_approved);
  const approvedAuctions = auctions.filter(auction => auction.is_approved);
  const otherAuctions = auctions.filter(auction => auction.status !== 'pending_approval' && !auction.is_approved);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Auctions Management</h1>
        <Button onClick={fetchAuctions} variant="outline">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading auctions...</div>
      ) : (
        <>
          {pendingAuctions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Pending Approval ({pendingAuctions.length})</h2>
              <AuctionsTable 
                auctions={pendingAuctions}
                onApprove={handleApproveAuction}
                onPause={handlePauseAuction}
                onOpenDeleteDialog={openDeleteDialog}
              />
            </div>
          )}
          
          {approvedAuctions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Approved Auctions ({approvedAuctions.length})</h2>
              <AuctionsTable 
                auctions={approvedAuctions}
                onApprove={handleApproveAuction}
                onPause={handlePauseAuction}
                onOpenDeleteDialog={openDeleteDialog}
              />
            </div>
          )}
          
          {otherAuctions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Other Auctions ({otherAuctions.length})</h2>
              <AuctionsTable 
                auctions={otherAuctions}
                onApprove={handleApproveAuction}
                onPause={handlePauseAuction}
                onOpenDeleteDialog={openDeleteDialog}
              />
            </div>
          )}

          {auctions.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No auctions found.</p>
            </div>
          )}
        </>
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
