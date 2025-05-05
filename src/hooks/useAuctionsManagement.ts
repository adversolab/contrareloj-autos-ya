
import { useState, useEffect } from 'react';
import { 
  getAuctions, 
  approveAuction, 
  deleteAuction, 
  pauseAuction
} from '@/services/admin/auctionService';
import { AdminAuction } from '@/services/admin/types';

export const useAuctionsManagement = () => {
  const [auctions, setAuctions] = useState<AdminAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auctionToDelete, setAuctionToDelete] = useState<string | null>(null);

  const fetchAuctions = async () => {
    setLoading(true);
    const { auctions: fetchedAuctions } = await getAuctions();
    setAuctions(fetchedAuctions);
    setLoading(false);
  };

  const handleApproveAuction = async (auctionId: string) => {
    const success = await approveAuction(auctionId);
    if (success) {
      await fetchAuctions();
    }
  };

  const handlePauseAuction = async (auctionId: string) => {
    const success = await pauseAuction(auctionId);
    if (success) {
      await fetchAuctions();
    }
  };

  const openDeleteDialog = (auctionId: string) => {
    setAuctionToDelete(auctionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAuction = async () => {
    if (!auctionToDelete) return;
    
    console.log('Attempting to delete auction:', auctionToDelete);
    const success = await deleteAuction(auctionToDelete);
    
    if (success) {
      console.log('Auction deleted successfully, refreshing list...');
      await fetchAuctions();
    } else {
      console.error('Failed to delete auction');
    }
    
    setDeleteDialogOpen(false);
    setAuctionToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAuctionToDelete(null);
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return {
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
  };
};
