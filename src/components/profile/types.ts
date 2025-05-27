export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  kilometers: number;
  fuel: string;
  transmission: string;
  description: string;
  photo_url?: string;
  created_at?: string;
  auctions?: any[];
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentBid: number;
  endTime: Date;
  bidCount: number;
  status?: string;
  auctionId?: string | null;
  vehicleId?: string;
  highlighted?: boolean; // Nueva propiedad para vehículos destacados
}
