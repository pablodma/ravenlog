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
      assignment_records: {
        Row: {
          assignment_type: string
          created_at: string | null
          created_by: string | null
          effective_date: string
          from_position_id: string | null
          from_role: string | null
          from_unit_id: string | null
          id: string
          notes: string | null
          reason: string | null
          to_position_id: string | null
          to_role: string | null
          to_unit_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assignment_type: string
          created_at?: string | null
          created_by?: string | null
          effective_date: string
          from_position_id?: string | null
          from_role?: string | null
          from_unit_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          to_position_id?: string | null
          to_role?: string | null
          to_unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assignment_type?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          from_position_id?: string | null
          from_role?: string | null
          from_unit_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          to_position_id?: string | null
          to_role?: string | null
          to_unit_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_records_from_position_id_fkey"
            columns: ["from_position_id"]
            isOneToOne: false
            referencedRelation: "unit_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_records_from_unit_id_fkey"
            columns: ["from_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_records_to_position_id_fkey"
            columns: ["to_position_id"]
            isOneToOne: false
            referencedRelation: "unit_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_records_to_unit_id_fkey"
            columns: ["to_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fields: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      forms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          instructions: string | null
          is_active: boolean
          is_public: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_public?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean
          is_public?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          field_type: string
          form_id: string
          id: string
          is_active: boolean
          is_required: boolean
          label: string
          options: Json | null
          placeholder: string | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          field_type: string
          form_id: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          label: string
          options?: Json | null
          placeholder?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          field_type?: string
          form_id?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          label?: string
          options?: Json | null
          placeholder?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string
          form_data: Json
          form_id: string
          id: string
          is_read: boolean
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_by: string | null
          submitted_by_email: string | null
          submitted_by_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          form_data: Json
          form_id: string
          id?: string
          is_read?: boolean
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string | null
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          form_data?: Json
          form_id?: string
          id?: string
          is_read?: boolean
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string | null
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          position_id: string | null
          rank_id: string | null
          role: string
          role_id: string | null
          secondary_roles: string[] | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          position_id?: string | null
          rank_id?: string | null
          role?: string
          role_id?: string | null
          secondary_roles?: string[] | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          position_id?: string | null
          rank_id?: string | null
          role?: string
          role_id?: string | null
          secondary_roles?: string[] | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "unit_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "rank_eligibility"
            referencedColumns: ["current_rank_id"]
          },
          {
            foreignKeyName: "profiles_rank_id_fkey"
            columns: ["rank_id"]
            isOneToOne: false
            referencedRelation: "ranks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      ranks: {
        Row: {
          abbreviation: string
          created_at: string
          custom_requirements: Json | null
          description: string | null
          id: string
          image_url: string | null
          minimum_accuracy: number | null
          minimum_kd_ratio: number | null
          name: string
          order: number
          required_certification_ids: string[] | null
          required_flight_hours: number | null
          required_kills: number | null
          required_landings: number | null
          required_missions: number | null
          required_takeoffs: number | null
          requirements_enforced: boolean | null
          time_in_previous_rank_days: number | null
        }
        Insert: {
          abbreviation: string
          created_at?: string
          custom_requirements?: Json | null
          description?: string | null
          id?: string
          image_url?: string | null
          minimum_accuracy?: number | null
          minimum_kd_ratio?: number | null
          name: string
          order: number
          required_certification_ids?: string[] | null
          required_flight_hours?: number | null
          required_kills?: number | null
          required_landings?: number | null
          required_missions?: number | null
          required_takeoffs?: number | null
          requirements_enforced?: boolean | null
          time_in_previous_rank_days?: number | null
        }
        Update: {
          abbreviation?: string
          created_at?: string
          custom_requirements?: Json | null
          description?: string | null
          id?: string
          image_url?: string | null
          minimum_accuracy?: number | null
          minimum_kd_ratio?: number | null
          name?: string
          order?: number
          required_certification_ids?: string[] | null
          required_flight_hours?: number | null
          required_kills?: number | null
          required_landings?: number | null
          required_missions?: number | null
          required_takeoffs?: number | null
          requirements_enforced?: boolean | null
          time_in_previous_rank_days?: number | null
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