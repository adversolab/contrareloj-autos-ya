
export interface Auction {
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

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  description?: string;
  created_at: string;
  photo_url?: string;
  auctions?: any[];
  // Add other vehicle fields as needed
}

// Extended vehicle interface to match what's expected by other components
export interface ExtendedVehicle extends Vehicle {
  vehicles?: {
    id?: string;
    brand?: string;
    model?: string;
    year?: number;
    description?: string;
    photo_url?: string;
  }
}
