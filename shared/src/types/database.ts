export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'personnel' | 'candidate'
          role_id?: string | null
          unit_id?: string | null
          rank_id?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'personnel' | 'candidate'
          role_id?: string | null
          unit_id?: string | null
          rank_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'personnel' | 'candidate'
          role_id?: string | null
          unit_id?: string | null
          rank_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ranks: {
        Row: {
          id: string
          name: string
          abbreviation: string
          order: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          abbreviation: string
          order: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          abbreviation?: string
          order?: number
          image_url?: string | null
          created_at?: string
        }
      }
      personnel: {
        Row: {
          id: string
          profile_id: string
          callsign: string
          rank_id: string
          flight_unit: string | null
          status: 'active' | 'inactive' | 'leave' | 'discharged'
          enlistment_date: string
          discord_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          callsign: string
          rank_id: string
          flight_unit?: string | null
          status?: 'active' | 'inactive' | 'leave' | 'discharged'
          enlistment_date: string
          discord_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          callsign?: string
          rank_id?: string
          flight_unit?: string | null
          status?: 'active' | 'inactive' | 'leave' | 'discharged'
          enlistment_date?: string
          discord_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          profile_id: string
          status: 'pending' | 'under_review' | 'accepted' | 'rejected'
          callsign_requested: string
          motivation: string
          experience_level: string
          preferred_role: string
          availability: string
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          status?: 'pending' | 'under_review' | 'accepted' | 'rejected'
          callsign_requested: string
          motivation: string
          experience_level: string
          preferred_role: string
          availability: string
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          status?: 'pending' | 'under_review' | 'accepted' | 'rejected'
          callsign_requested?: string
          motivation?: string
          experience_level?: string
          preferred_role?: string
          availability?: string
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          notes?: string | null
        }
      }
      certifications: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          requirements: string
          image_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          requirements: string
          image_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          requirements?: string
          image_url?: string | null
          active?: boolean
          created_at?: string
        }
      }
      personnel_certifications: {
        Row: {
          id: string
          personnel_id: string
          certification_id: string
          awarded_by: string
          awarded_at: string
          expires_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          personnel_id: string
          certification_id: string
          awarded_by: string
          awarded_at?: string
          expires_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          personnel_id?: string
          certification_id?: string
          awarded_by?: string
          awarded_at?: string
          expires_at?: string | null
          notes?: string | null
        }
      }
      medals: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          requirements: string
          image_url: string | null
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          points: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          requirements: string
          image_url?: string | null
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          points?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          requirements?: string
          image_url?: string | null
          rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          points?: number
          active?: boolean
          created_at?: string
        }
      }
      personnel_medals: {
        Row: {
          id: string
          personnel_id: string
          medal_id: string
          awarded_by: string
          awarded_at: string
          reason: string | null
        }
        Insert: {
          id?: string
          personnel_id: string
          medal_id: string
          awarded_by: string
          awarded_at?: string
          reason?: string | null
        }
        Update: {
          id?: string
          personnel_id?: string
          medal_id?: string
          awarded_by?: string
          awarded_at?: string
          reason?: string | null
        }
      }
      dcs_logs: {
        Row: {
          id: string
          personnel_id: string | null
          event_type: string
          event_data: Json
          mission_name: string | null
          server_name: string
          timestamp: string
          processed_at: string
        }
        Insert: {
          id?: string
          personnel_id?: string | null
          event_type: string
          event_data: Json
          mission_name?: string | null
          server_name: string
          timestamp: string
          processed_at?: string
        }
        Update: {
          id?: string
          personnel_id?: string | null
          event_type?: string
          event_data?: Json
          mission_name?: string | null
          server_name?: string
          timestamp?: string
          processed_at?: string
        }
      }
      event_types: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string
          is_system_type: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          is_system_type?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          is_system_type?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      flight_events_calendar: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type_id: string | null
          start_date: string
          end_date: string
          timezone: string
          is_all_day: boolean
          server_name: string | null
          server_password: string | null
          voice_channel: string | null
          organizer_id: string
          max_participants: number | null
          min_participants: number
          status: 'scheduled' | 'active' | 'completed' | 'cancelled'
          visibility: 'public' | 'unit_only' | 'private'
          required_aircraft: string[] | null
          required_certifications: string[] | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          briefing_notes: string | null
          debrief_notes: string | null
          external_links: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type_id?: string | null
          start_date: string
          end_date: string
          timezone?: string
          is_all_day?: boolean
          server_name?: string | null
          server_password?: string | null
          voice_channel?: string | null
          organizer_id: string
          max_participants?: number | null
          min_participants?: number
          status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
          visibility?: 'public' | 'unit_only' | 'private'
          required_aircraft?: string[] | null
          required_certifications?: string[] | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          briefing_notes?: string | null
          debrief_notes?: string | null
          external_links?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type_id?: string | null
          start_date?: string
          end_date?: string
          timezone?: string
          is_all_day?: boolean
          server_name?: string | null
          server_password?: string | null
          voice_channel?: string | null
          organizer_id?: string
          max_participants?: number | null
          min_participants?: number
          status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
          visibility?: 'public' | 'unit_only' | 'private'
          required_aircraft?: string[] | null
          required_certifications?: string[] | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          briefing_notes?: string | null
          debrief_notes?: string | null
          external_links?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
          role: 'participant' | 'flight_lead' | 'instructor' | 'observer'
          aircraft: string | null
          callsign: string | null
          notes: string | null
          registered_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
          role?: 'participant' | 'flight_lead' | 'instructor' | 'observer'
          aircraft?: string | null
          callsign?: string | null
          notes?: string | null
          registered_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
          role?: 'participant' | 'flight_lead' | 'instructor' | 'observer'
          aircraft?: string | null
          callsign?: string | null
          notes?: string | null
          registered_at?: string
          updated_at?: string
        }
      }
      event_comments: {
        Row: {
          id: string
          event_id: string
          user_id: string
          comment: string
          is_briefing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          comment: string
          is_briefing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          comment?: string
          is_briefing?: boolean
          created_at?: string
          updated_at?: string
        }
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

// Tipos de utilidad para el frontend
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
