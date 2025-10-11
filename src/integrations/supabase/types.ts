export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bank_transactions: {
        Row: {
          amount: number
          category: string | null
          connection_id: string
          created_at: string
          description: string | null
          id: string
          merchant_name: string | null
          status: string
          synced_at: string
          timestamp: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          connection_id: string
          created_at?: string
          description?: string | null
          id?: string
          merchant_name?: string | null
          status?: string
          synced_at?: string
          timestamp: string
          transaction_id: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          connection_id?: string
          created_at?: string
          description?: string | null
          id?: string
          merchant_name?: string | null
          status?: string
          synced_at?: string
          timestamp?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "truelayer_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tips_shown: {
        Row: {
          dismissed: boolean | null
          id: string
          opened_full_lesson: boolean | null
          shown_at: string | null
          tip_id: string
          user_id: string
        }
        Insert: {
          dismissed?: boolean | null
          id?: string
          opened_full_lesson?: boolean | null
          shown_at?: string | null
          tip_id: string
          user_id: string
        }
        Update: {
          dismissed?: boolean | null
          id?: string
          opened_full_lesson?: boolean | null
          shown_at?: string | null
          tip_id?: string
          user_id?: string
        }
        Relationships: []
      }
      expense_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          transaction_date: string
          updated_at: string
          user_id: string
          vat_rate: number
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_date: string
          updated_at?: string
          user_id: string
          vat_rate?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          updated_at?: string
          user_id?: string
          vat_rate?: number
        }
        Relationships: []
      }
      hmrc_oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      hmrc_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          transaction_date: string
          updated_at: string
          user_id: string
          vat_rate: number
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_date: string
          updated_at?: string
          user_id: string
          vat_rate?: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          updated_at?: string
          user_id?: string
          vat_rate?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          id: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          id: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      tooltip_interactions: {
        Row: {
          clicked_at: string | null
          id: string
          tooltip_id: string
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          tooltip_id: string
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          id?: string
          tooltip_id?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_mappings: {
        Row: {
          bank_transaction_id: string
          confidence_score: number | null
          created_at: string
          expense_transaction_id: string | null
          id: string
          income_transaction_id: string | null
          mapping_type: string
          user_confirmed: boolean
        }
        Insert: {
          bank_transaction_id: string
          confidence_score?: number | null
          created_at?: string
          expense_transaction_id?: string | null
          id?: string
          income_transaction_id?: string | null
          mapping_type: string
          user_confirmed?: boolean
        }
        Update: {
          bank_transaction_id?: string
          confidence_score?: number | null
          created_at?: string
          expense_transaction_id?: string | null
          id?: string
          income_transaction_id?: string | null
          mapping_type?: string
          user_confirmed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "transaction_mappings_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_mappings_expense_transaction_id_fkey"
            columns: ["expense_transaction_id"]
            isOneToOne: false
            referencedRelation: "expense_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_mappings_income_transaction_id_fkey"
            columns: ["income_transaction_id"]
            isOneToOne: false
            referencedRelation: "income_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_rules: {
        Row: {
          action: string
          confidence_level: string | null
          created_at: string | null
          description_pattern: string | null
          enabled: boolean | null
          id: string
          last_applied_at: string | null
          merchant_pattern: string
          times_applied: number | null
          user_id: string
          vat_rate: number | null
        }
        Insert: {
          action: string
          confidence_level?: string | null
          created_at?: string | null
          description_pattern?: string | null
          enabled?: boolean | null
          id?: string
          last_applied_at?: string | null
          merchant_pattern: string
          times_applied?: number | null
          user_id: string
          vat_rate?: number | null
        }
        Update: {
          action?: string
          confidence_level?: string | null
          created_at?: string | null
          description_pattern?: string | null
          enabled?: boolean | null
          id?: string
          last_applied_at?: string | null
          merchant_pattern?: string
          times_applied?: number | null
          user_id?: string
          vat_rate?: number | null
        }
        Relationships: []
      }
      truelayer_connections: {
        Row: {
          access_token: string
          account_id: string
          account_name: string | null
          created_at: string
          expires_at: string
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_id: string
          account_name?: string | null
          created_at?: string
          expires_at: string
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_id?: string
          account_name?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string
          saved: boolean | null
          started_at: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id: string
          saved?: boolean | null
          started_at?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          saved?: boolean | null
          started_at?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number | null
          last_activity_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          last_activity_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vat_submissions: {
        Row: {
          created_at: string
          id: string
          net_vat_due: number
          period_key: string
          submitted_at: string | null
          total_acquisitions_ex_vat: number
          total_value_goods_supplied_ex_vat: number
          total_value_purchases_ex_vat: number
          total_value_sales_ex_vat: number
          total_vat_due: number
          updated_at: string
          user_id: string
          vat_due_acquisitions: number
          vat_due_sales: number
          vat_reclaimed_curr_period: number
        }
        Insert: {
          created_at?: string
          id?: string
          net_vat_due: number
          period_key: string
          submitted_at?: string | null
          total_acquisitions_ex_vat?: number
          total_value_goods_supplied_ex_vat?: number
          total_value_purchases_ex_vat: number
          total_value_sales_ex_vat: number
          total_vat_due: number
          updated_at?: string
          user_id: string
          vat_due_acquisitions?: number
          vat_due_sales: number
          vat_reclaimed_curr_period: number
        }
        Update: {
          created_at?: string
          id?: string
          net_vat_due?: number
          period_key?: string
          submitted_at?: string | null
          total_acquisitions_ex_vat?: number
          total_value_goods_supplied_ex_vat?: number
          total_value_purchases_ex_vat?: number
          total_value_sales_ex_vat?: number
          total_vat_due?: number
          updated_at?: string
          user_id?: string
          vat_due_acquisitions?: number
          vat_due_sales?: number
          vat_reclaimed_curr_period?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
