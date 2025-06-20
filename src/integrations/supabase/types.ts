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
      shyft_config: {
        Row: {
          api_key_encrypted: string
          created_at: string
          id: string
          network: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted: string
          created_at?: string
          id?: string
          network?: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string
          created_at?: string
          id?: string
          network?: string
          updated_at?: string
        }
        Relationships: []
      }
      shyft_token_balances: {
        Row: {
          balance: number
          created_at: string
          decimals: number
          id: string
          is_native: boolean | null
          last_updated: string
          metadata: Json | null
          token_address: string
          token_name: string | null
          token_symbol: string | null
          ui_amount: number
          usd_value: number | null
          wallet_address: string
        }
        Insert: {
          balance?: number
          created_at?: string
          decimals?: number
          id?: string
          is_native?: boolean | null
          last_updated?: string
          metadata?: Json | null
          token_address: string
          token_name?: string | null
          token_symbol?: string | null
          ui_amount?: number
          usd_value?: number | null
          wallet_address: string
        }
        Update: {
          balance?: number
          created_at?: string
          decimals?: number
          id?: string
          is_native?: boolean | null
          last_updated?: string
          metadata?: Json | null
          token_address?: string
          token_name?: string | null
          token_symbol?: string | null
          ui_amount?: number
          usd_value?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      shyft_wallet_cache: {
        Row: {
          created_at: string
          id: string
          last_updated: string
          raw_data: Json
          sol_balance: number | null
          token_count: number | null
          total_usd_value: number | null
          wallet_address: string
          wallet_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_updated?: string
          raw_data: Json
          sol_balance?: number | null
          token_count?: number | null
          total_usd_value?: number | null
          wallet_address: string
          wallet_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_updated?: string
          raw_data?: Json
          sol_balance?: number | null
          token_count?: number | null
          total_usd_value?: number | null
          wallet_address?: string
          wallet_name?: string | null
        }
        Relationships: []
      }
      wallet_balances: {
        Row: {
          balance: number
          id: string
          is_lp_token: boolean | null
          last_updated: string
          lp_details: string | null
          platform: string | null
          token_address: string | null
          token_name: string | null
          token_symbol: string
          usd_value: number | null
          wallet_id: string
        }
        Insert: {
          balance?: number
          id?: string
          is_lp_token?: boolean | null
          last_updated?: string
          lp_details?: string | null
          platform?: string | null
          token_address?: string | null
          token_name?: string | null
          token_symbol: string
          usd_value?: number | null
          wallet_id: string
        }
        Update: {
          balance?: number
          id?: string
          is_lp_token?: boolean | null
          last_updated?: string
          lp_details?: string | null
          platform?: string | null
          token_address?: string | null
          token_name?: string | null
          token_symbol?: string
          usd_value?: number | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_balances_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          address: string
          blockchain: string
          created_at: string
          description: string | null
          explorer_url: string
          id: string
          name: string
          updated_at: string
          wallet_type: string
        }
        Insert: {
          address: string
          blockchain: string
          created_at?: string
          description?: string | null
          explorer_url: string
          id?: string
          name: string
          updated_at?: string
          wallet_type: string
        }
        Update: {
          address?: string
          blockchain?: string
          created_at?: string
          description?: string | null
          explorer_url?: string
          id?: string
          name?: string
          updated_at?: string
          wallet_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_monitored_wallets_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          wallet_address: string
          wallet_name: string
          sol_balance: number
          total_usd_value: number
          token_count: number
          last_updated: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
