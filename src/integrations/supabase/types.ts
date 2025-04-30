export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auction_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          auction_id: string
          created_at: string
          id: string
          is_answered: boolean
          question: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          auction_id: string
          created_at?: string
          id?: string
          is_answered?: boolean
          question: string
          user_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          auction_id?: string
          created_at?: string
          id?: string
          is_answered?: boolean
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_questions_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_services: {
        Row: {
          auction_id: string | null
          created_at: string
          id: string
          price: number
          service_type: string
        }
        Insert: {
          auction_id?: string | null
          created_at?: string
          id?: string
          price: number
          service_type: string
        }
        Update: {
          auction_id?: string | null
          created_at?: string
          id?: string
          price?: number
          service_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "auction_services_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      auctions: {
        Row: {
          created_at: string
          duration_days: number
          end_date: string | null
          id: string
          is_approved: boolean | null
          min_increment: number
          reserve_price: number
          start_date: string | null
          start_price: number
          status: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          duration_days: number
          end_date?: string | null
          id?: string
          is_approved?: boolean | null
          min_increment: number
          reserve_price: number
          start_date?: string | null
          start_price: number
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          duration_days?: number
          end_date?: string | null
          id?: string
          is_approved?: boolean | null
          min_increment?: number
          reserve_price?: number
          start_date?: string | null
          start_price?: number
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auctions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          auction_id: string
          created_at: string
          hold_amount: number
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auction_id: string
          created_at?: string
          hold_amount: number
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auction_id?: string
          created_at?: string
          hold_amount?: number
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          auction_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          auction_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          auction_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          identity_document_url: string | null
          identity_selfie_url: string | null
          identity_verified: boolean | null
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          rut: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          identity_document_url?: string | null
          identity_selfie_url?: string | null
          identity_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          rut?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          identity_document_url?: string | null
          identity_selfie_url?: string | null
          identity_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          rut?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicle_features: {
        Row: {
          category: string
          created_at: string
          feature: string
          id: string
          vehicle_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          feature: string
          id?: string
          vehicle_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          feature?: string
          id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_features_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          position: number
          url: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          position: number
          url: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          position?: number
          url?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_photos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string
          description: string | null
          fuel: string
          id: string
          is_approved: boolean | null
          kilometers: number
          model: string
          transmission: string
          updated_at: string
          user_id: string | null
          year: number
        }
        Insert: {
          brand: string
          created_at?: string
          description?: string | null
          fuel: string
          id?: string
          is_approved?: boolean | null
          kilometers: number
          model: string
          transmission: string
          updated_at?: string
          user_id?: string | null
          year: number
        }
        Update: {
          brand?: string
          created_at?: string
          description?: string | null
          fuel?: string
          id?: string
          is_approved?: boolean | null
          kilometers?: number
          model?: string
          transmission?: string
          updated_at?: string
          user_id?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "admin", "moderator"],
    },
  },
} as const
