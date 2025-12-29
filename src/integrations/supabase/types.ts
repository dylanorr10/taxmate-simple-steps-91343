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
      cash_flow_forecasts: {
        Row: {
          confidence_score: number
          created_at: string
          forecast_month: string
          id: string
          predicted_expenses: number
          predicted_income: number
          predicted_net: number
          user_id: string
        }
        Insert: {
          confidence_score?: number
          created_at?: string
          forecast_month: string
          id?: string
          predicted_expenses?: number
          predicted_income?: number
          predicted_net?: number
          user_id: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          forecast_month?: string
          id?: string
          predicted_expenses?: number
          predicted_income?: number
          predicted_net?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_flow_forecasts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          receipt_url: string | null
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
          receipt_url?: string | null
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
          receipt_url?: string | null
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
          client_email: string | null
          client_name: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          payment_status: string | null
          transaction_date: string
          updated_at: string
          user_id: string
          vat_rate: number
        }
        Insert: {
          amount: number
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          payment_status?: string | null
          transaction_date: string
          updated_at?: string
          user_id: string
          vat_rate?: number
        }
        Update: {
          amount?: number
          client_email?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          payment_status?: string | null
          transaction_date?: string
          updated_at?: string
          user_id?: string
          vat_rate?: number
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          color: string
          created_at: string
          description: string
          difficulty: string
          emoji: string
          id: string
          lesson_ids: string[]
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description: string
          difficulty?: string
          emoji: string
          id?: string
          lesson_ids?: string[]
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          difficulty?: string
          emoji?: string
          id?: string
          lesson_ids?: string[]
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          category: string
          content: Json
          created_at: string
          difficulty: string
          duration: number
          emoji: string
          id: string
          lesson_type: string | null
          order_index: number
          quiz_required: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: Json
          created_at?: string
          difficulty: string
          duration: number
          emoji: string
          id?: string
          lesson_type?: string | null
          order_index: number
          quiz_required?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          difficulty?: string
          duration?: number
          emoji?: string
          id?: string
          lesson_type?: string | null
          order_index?: number
          quiz_required?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          created_at: string
          days_overdue: number
          id: string
          income_transaction_id: string
          reminder_type: string
          sent_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_overdue: number
          id?: string
          income_transaction_id: string
          reminder_type: string
          sent_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_overdue?: number
          id?: string
          income_transaction_id?: string
          reminder_type?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_income_transaction_id_fkey"
            columns: ["income_transaction_id"]
            isOneToOne: false
            referencedRelation: "income_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          business_type: string | null
          created_at: string
          demo_mode: boolean | null
          experience_level: string | null
          id: string
          nav_items: Json | null
          profile_complete: boolean | null
          updated_at: string
          vat_number: string | null
          vat_registered: boolean | null
        }
        Insert: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          demo_mode?: boolean | null
          experience_level?: string | null
          id: string
          nav_items?: Json | null
          profile_complete?: boolean | null
          updated_at?: string
          vat_number?: string | null
          vat_registered?: boolean | null
        }
        Update: {
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          demo_mode?: boolean | null
          experience_level?: string | null
          id?: string
          nav_items?: Json | null
          profile_complete?: boolean | null
          updated_at?: string
          vat_number?: string | null
          vat_registered?: boolean | null
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
      user_confidence_ratings: {
        Row: {
          action_type: string
          confidence_level: number
          context_data: Json | null
          created_at: string | null
          id: string
          user_id: string
          was_correct: boolean | null
        }
        Insert: {
          action_type: string
          confidence_level: number
          context_data?: Json | null
          created_at?: string | null
          id?: string
          user_id: string
          was_correct?: boolean | null
        }
        Update: {
          action_type?: string
          confidence_level?: number
          context_data?: Json | null
          created_at?: string | null
          id?: string
          user_id?: string
          was_correct?: boolean | null
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          completion_rate: number | null
          created_at: string | null
          id: string
          lesson_id: string
          saved: boolean | null
          source: string | null
          started_at: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          lesson_id: string
          saved?: boolean | null
          source?: string | null
          started_at?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          lesson_id?: string
          saved?: boolean | null
          source?: string | null
          started_at?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_path_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_lesson_index: number
          id: string
          path_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_lesson_index?: number
          id?: string
          path_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_lesson_index?: number
          id?: string
          path_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_path_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          bookmarked: boolean | null
          completed_at: string | null
          completion_rate: number | null
          created_at: string
          id: string
          lesson_id: string
          mastery_level: number | null
          notes: string | null
          quiz_attempts: number | null
          quiz_score: number | null
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bookmarked?: boolean | null
          completed_at?: string | null
          completion_rate?: number | null
          created_at?: string
          id?: string
          lesson_id: string
          mastery_level?: number | null
          notes?: string | null
          quiz_attempts?: number | null
          quiz_score?: number | null
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bookmarked?: boolean | null
          completed_at?: string | null
          completion_rate?: number | null
          created_at?: string
          id?: string
          lesson_id?: string
          mastery_level?: number | null
          notes?: string | null
          quiz_attempts?: number | null
          quiz_score?: number | null
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
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
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          notified: boolean
          profession_interest: string | null
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified?: boolean
          profession_interest?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified?: boolean
          profession_interest?: string | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_waitlist_count: { Args: never; Returns: number }
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
