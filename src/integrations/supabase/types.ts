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
      admin_logs: {
        Row: {
          accion: string
          admin_id: string
          created_at: string
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          detalle: string | null
          id: string
          ip_address: unknown | null
          registro_afectado_id: string | null
          tabla_afectada: string | null
          user_agent: string | null
        }
        Insert: {
          accion: string
          admin_id: string
          created_at?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          detalle?: string | null
          id?: string
          ip_address?: unknown | null
          registro_afectado_id?: string | null
          tabla_afectada?: string | null
          user_agent?: string | null
        }
        Update: {
          accion?: string
          admin_id?: string
          created_at?: string
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          detalle?: string | null
          id?: string
          ip_address?: unknown | null
          registro_afectado_id?: string | null
          tabla_afectada?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          penalized: boolean
          purchase_confirmed: boolean
          reserve_price: number
          start_date: string | null
          start_price: number
          status: string
          updated_at: string
          vehicle_id: string | null
          winner_id: string | null
          winning_bid: number | null
        }
        Insert: {
          created_at?: string
          duration_days: number
          end_date?: string | null
          id?: string
          is_approved?: boolean | null
          min_increment: number
          penalized?: boolean
          purchase_confirmed?: boolean
          reserve_price: number
          start_date?: string | null
          start_price: number
          status?: string
          updated_at?: string
          vehicle_id?: string | null
          winner_id?: string | null
          winning_bid?: number | null
        }
        Update: {
          created_at?: string
          duration_days?: number
          end_date?: string | null
          id?: string
          is_approved?: boolean | null
          min_increment?: number
          penalized?: boolean
          purchase_confirmed?: boolean
          reserve_price?: number
          start_date?: string | null
          start_price?: number
          status?: string
          updated_at?: string
          vehicle_id?: string | null
          winner_id?: string | null
          winning_bid?: number | null
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
      mensajes_template: {
        Row: {
          categoria: string | null
          contenido: string
          creado_por: string
          fecha_creacion: string
          id: string
          titulo: string
        }
        Insert: {
          categoria?: string | null
          contenido: string
          creado_por: string
          fecha_creacion?: string
          id?: string
          titulo: string
        }
        Update: {
          categoria?: string | null
          contenido?: string
          creado_por?: string
          fecha_creacion?: string
          id?: string
          titulo?: string
        }
        Relationships: []
      }
      movimientos_credito: {
        Row: {
          cantidad: number
          created_at: string
          descripcion: string
          fecha: string
          id: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          cantidad: number
          created_at?: string
          descripcion: string
          fecha?: string
          id?: string
          tipo: string
          usuario_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          descripcion?: string
          fecha?: string
          id?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          sent_by: string | null
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
          sent_by?: string | null
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
          sent_by?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blocked: boolean
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          identity_document_url: string | null
          identity_selfie_url: string | null
          identity_verified: boolean | null
          last_name: string | null
          penalizaciones: number
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          rut: string | null
          saldo_creditos: number
          subastas_abandonadas: number
          subastas_ganadas: number
          updated_at: string | null
          valoracion_promedio: number | null
        }
        Insert: {
          avatar_url?: string | null
          blocked?: boolean
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          identity_document_url?: string | null
          identity_selfie_url?: string | null
          identity_verified?: boolean | null
          last_name?: string | null
          penalizaciones?: number
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          rut?: string | null
          saldo_creditos?: number
          subastas_abandonadas?: number
          subastas_ganadas?: number
          updated_at?: string | null
          valoracion_promedio?: number | null
        }
        Update: {
          avatar_url?: string | null
          blocked?: boolean
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          identity_document_url?: string | null
          identity_selfie_url?: string | null
          identity_verified?: boolean | null
          last_name?: string | null
          penalizaciones?: number
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          rut?: string | null
          saldo_creditos?: number
          subastas_abandonadas?: number
          subastas_ganadas?: number
          updated_at?: string | null
          valoracion_promedio?: number | null
        }
        Relationships: []
      }
      reportes: {
        Row: {
          created_at: string
          detalle: string
          estado: string
          fecha: string
          id: string
          referencia_id: string | null
          tipo: string
          updated_at: string
          usuario_que_reporta_id: string
          usuario_reportado_id: string | null
        }
        Insert: {
          created_at?: string
          detalle: string
          estado?: string
          fecha?: string
          id?: string
          referencia_id?: string | null
          tipo: string
          updated_at?: string
          usuario_que_reporta_id: string
          usuario_reportado_id?: string | null
        }
        Update: {
          created_at?: string
          detalle?: string
          estado?: string
          fecha?: string
          id?: string
          referencia_id?: string | null
          tipo?: string
          updated_at?: string
          usuario_que_reporta_id?: string
          usuario_reportado_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reportes_usuario_que_reporta_id_fkey"
            columns: ["usuario_que_reporta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_usuario_reportado_id_fkey"
            columns: ["usuario_reportado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      valoraciones_usuario: {
        Row: {
          comentario: string | null
          created_at: string
          evaluado_id: string
          evaluador_id: string
          fecha: string
          id: string
          puntuacion: number
          remate_id: string
          visible: boolean
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          evaluado_id: string
          evaluador_id: string
          fecha?: string
          id?: string
          puntuacion: number
          remate_id: string
          visible?: boolean
        }
        Update: {
          comentario?: string | null
          created_at?: string
          evaluado_id?: string
          evaluador_id?: string
          fecha?: string
          id?: string
          puntuacion?: number
          remate_id?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "valoraciones_usuario_remate_id_fkey"
            columns: ["remate_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
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
          autofact_report_url: string | null
          brand: string
          created_at: string
          description: string | null
          destacado: boolean
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
          autofact_report_url?: string | null
          brand: string
          created_at?: string
          description?: string | null
          destacado?: boolean
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
          autofact_report_url?: string | null
          brand?: string
          created_at?: string
          description?: string | null
          destacado?: boolean
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
      confirm_auction_purchase: {
        Args: { auction_id: string }
        Returns: Json
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_admin_id: string
          p_accion: string
          p_detalle?: string
          p_tabla_afectada?: string
          p_registro_afectado_id?: string
          p_datos_anteriores?: Json
          p_datos_nuevos?: Json
        }
        Returns: undefined
      }
      penalize_auction_abandonment: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      procesar_movimiento_credito: {
        Args: {
          p_usuario_id: string
          p_tipo: string
          p_cantidad: number
          p_descripcion: string
        }
        Returns: Json
      }
      update_reputation_on_purchase: {
        Args: { auction_id_param: string }
        Returns: Json
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
