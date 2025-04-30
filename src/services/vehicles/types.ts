
import { Database } from "@/integrations/supabase/types";

// Basic vehicle information
export interface VehicleBasicInfo {
  id?: string;
  brand: string;
  model: string;
  year: string;
  kilometers: string;
  fuel: string;
  transmission: string;
  description: string;
}

// Vehicle feature
export interface VehicleFeature {
  id?: string;
  vehicle_id?: string;
  category: string;
  feature: string;
}

// Auction information
export interface AuctionInfo {
  reservePrice: number;
  startPrice: number;
  durationDays: number;
  minIncrement: number;
  services: string[];
}

// Extended vehicle interface with photo_url
export interface VehicleWithPhoto {
  id: string;
  brand: string;
  model: string;
  year: number;
  kilometers: number;
  fuel: string;
  transmission: string;
  description: string;
  user_id: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  photo_url?: string;
  autofact_report_url?: string;
  auctions: any[];
}
