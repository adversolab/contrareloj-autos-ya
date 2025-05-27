
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Car, Heart, Gavel, FileText, Trophy, Coins } from 'lucide-react';
import BiddingTabContent from './BiddingTabContent';
import FavoritesTabContent from './FavoritesTabContent';
import SellingTabContent from './SellingTabContent';
import DraftsTabContent from './DraftsTabContent';
import WonTabContent from './WonTabContent';
import CreditSection from './CreditSection';
import { Auction } from './types';

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

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  biddingAuctions,
  favoriteAuctions,
  sellingAuctions,
  draftAuctions,
  wonAuctions,
  isLoadingVehicles,
  isLoadingFavorites,
  onDeleteDraft
}) => {
  return (
    <Tabs defaultValue="credits" className="mb-8">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="credits" className="flex items-center gap-2">
          <Coins className="w-4 h-4" />
          <span className="hidden sm:inline">Créditos</span>
        </TabsTrigger>
        <TabsTrigger value="bidding" className="flex items-center gap-2">
          <Gavel className="w-4 h-4" />
          <span className="hidden sm:inline">Pujando</span>
          {biddingAuctions.length > 0 && (
            <span className="bg-contrareloj text-white rounded-full px-2 py-0.5 text-xs">
              {biddingAuctions.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="favorites" className="flex items-center gap-2">
          <Heart className="w-4 h-4" />
          <span className="hidden sm:inline">Favoritos</span>
          {favoriteAuctions.length > 0 && (
            <span className="bg-contrareloj text-white rounded-full px-2 py-0.5 text-xs">
              {favoriteAuctions.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="selling" className="flex items-center gap-2">
          <Car className="w-4 h-4" />
          <span className="hidden sm:inline">Vendiendo</span>
          {sellingAuctions.length > 0 && (
            <span className="bg-contrareloj text-white rounded-full px-2 py-0.5 text-xs">
              {sellingAuctions.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="drafts" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Borradores</span>
          {draftAuctions.length > 0 && (
            <span className="bg-gray-500 text-white rounded-full px-2 py-0.5 text-xs">
              {draftAuctions.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="won" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Ganados</span>
          {wonAuctions.length > 0 && (
            <span className="bg-green-500 text-white rounded-full px-2 py-0.5 text-xs">
              {wonAuctions.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="credits" className="mt-6">
        <CreditSection />
      </TabsContent>

      <TabsContent value="bidding" className="mt-6">
        <BiddingTabContent auctions={biddingAuctions} />
      </TabsContent>

      <TabsContent value="favorites" className="mt-6">
        <FavoritesTabContent 
          auctions={favoriteAuctions} 
          isLoading={isLoadingFavorites} 
        />
      </TabsContent>

      <TabsContent value="selling" className="mt-6">
        <SellingTabContent 
          auctions={sellingAuctions} 
          isLoading={isLoadingVehicles} 
        />
      </TabsContent>

      <TabsContent value="drafts" className="mt-6">
        <DraftsTabContent 
          auctions={draftAuctions} 
          isLoading={isLoadingVehicles}
          onDeleteDraft={onDeleteDraft}
        />
      </TabsContent>

      <TabsContent value="won" className="mt-6">
        <WonTabContent auctions={wonAuctions} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
