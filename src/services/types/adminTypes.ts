
// Define admin-related types here
export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "user" | "admin" | "moderator";
  identity_verified: boolean;
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
