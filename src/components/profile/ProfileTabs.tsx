
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BiddingTabContent from './BiddingTabContent';
import FavoritesTabContent from './FavoritesTabContent';
import SellingTabContent from './SellingTabContent';
import DraftsTabContent from './DraftsTabContent';
import WonTabContent from './WonTabContent';

interface Auction {
  id: string | number;
  title: string;
  description: string;
  imageUrl?: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  status?: string;
  auctionId?: string | null;
  vehicleId?: string;
}

interface ProfileTabsProps {
  biddingAuctions: Auction[];
  favoriteAuctions: Auction[];
  sellingAuctions: Auction[];
  draftAuctions: Auction[];
  wonAuctions: Auction[];
  isLoadingVehicles: boolean;
  isLoadingFavorites: boolean;
  onDeleteDraft: () => void;
}

const ProfileTabs = ({
  biddingAuctions,
  favoriteAuctions,
  sellingAuctions,
  draftAuctions,
  wonAuctions,
  isLoadingVehicles,
  isLoadingFavorites,
  onDeleteDraft
}: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="selling" className="space-y-6">
      <TabsList className="w-full border-b">
        <TabsTrigger value="bidding" className="flex-1">
          Mis ofertas ({biddingAuctions.length})
        </TabsTrigger>
        <TabsTrigger value="favorites" className="flex-1">
          Favoritos ({favoriteAuctions.length})
        </TabsTrigger>
        <TabsTrigger value="selling" className="flex-1">
          Mis ventas ({sellingAuctions.length})
        </TabsTrigger>
        <TabsTrigger value="drafts" className="flex-1">
          Borradores ({draftAuctions.length})
        </TabsTrigger>
        <TabsTrigger value="won" className="flex-1">
          Ganados ({wonAuctions.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="bidding">
        <BiddingTabContent 
          biddingAuctions={biddingAuctions} 
          isLoading={false} 
        />
      </TabsContent>
      
      <TabsContent value="favorites">
        <FavoritesTabContent 
          favoriteAuctions={favoriteAuctions} 
          isLoading={isLoadingFavorites} 
        />
      </TabsContent>
      
      <TabsContent value="selling">
        <SellingTabContent 
          sellingAuctions={sellingAuctions} 
          isLoading={isLoadingVehicles} 
        />
      </TabsContent>
      
      <TabsContent value="drafts">
        <DraftsTabContent 
          draftAuctions={draftAuctions} 
          isLoading={isLoadingVehicles} 
          onDelete={onDeleteDraft} 
        />
      </TabsContent>
      
      <TabsContent value="won">
        <WonTabContent wonAuctions={wonAuctions} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
