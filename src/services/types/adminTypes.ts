
// Common type definitions for admin features
export interface UserDocuments {
  rut?: string;
  identity_document_url?: string;
  identity_selfie_url?: string;
  front_url?: string;
  back_url?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "user" | "admin" | "moderator";
  identity_verified: boolean;
  has_identity_document: boolean;  // Changed from optional to required
  has_selfie: boolean;  // Changed from optional to required
  has_rut: boolean;  // Changed from optional to required
  created_at: string;
}

export interface AdminVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  user_id: string;
  is_approved: boolean;
  created_at: string;
  user: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  };
}

export interface AdminAuction {
  id: string;
  start_price: number;
  reserve_price: number;
  status: string;
  vehicle_id: string;
  is_approved: boolean;
  created_at: string;
  vehicle: {
    brand: string;
    model: string;
    year: number;
  };
  user: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  };
}
