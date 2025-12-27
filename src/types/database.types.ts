/**
 * Database types generated from Supabase
 *
 * To regenerate these types, run:
 * npx supabase gen types typescript --project-id [your-project-id] > src/types/database.types.ts
 *
 * This file will be replaced once you set up your Supabase project
 */

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
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          password_plain: string | null
          name: string
          role: 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          password_plain?: string | null
          name: string
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          password_plain?: string | null
          name?: string
          role?: 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      project_users: {
        Row: {
          id: string
          project_id: string
          user_id: string
          assigned_by: string | null
          assigned_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          assigned_by?: string | null
          assigned_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          assigned_by?: string | null
          assigned_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          slug: string
          name: string
          client_name: string
          team_id: string | null
          qr_code_url: string | null
          status: 'active' | 'archived' | 'deleted'
          created_by: string
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          client_name: string
          team_id?: string | null
          qr_code_url?: string | null
          status?: 'active' | 'archived' | 'deleted'
          created_by: string
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          client_name?: string
          team_id?: string | null
          qr_code_url?: string | null
          status?: 'active' | 'archived' | 'deleted'
          created_by?: string
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
      }
      presentation_config: {
        Row: {
          id: string
          project_id: string
          font_family: string
          font_size: number
          text_color: string
          outline_color: string
          background_color: string
          background_image_url: string | null
          allow_video_uploads: boolean
          max_video_duration: number
          transition_duration: number
          animation_style: 'fade' | 'slide' | 'zoom'
          layout_template: string
          randomize_order: boolean
          allow_video_finish: boolean
          require_email: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          font_family?: string
          font_size?: number
          text_color?: string
          outline_color?: string
          background_color?: string
          background_image_url?: string | null
          allow_video_uploads?: boolean
          max_video_duration?: number
          transition_duration?: number
          animation_style?: 'fade' | 'slide' | 'zoom'
          layout_template?: string
          randomize_order?: boolean
          allow_video_finish?: boolean
          require_email?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          font_family?: string
          font_size?: number
          text_color?: string
          outline_color?: string
          background_color?: string
          background_image_url?: string | null
          allow_video_uploads?: boolean
          max_video_duration?: number
          transition_duration?: number
          animation_style?: 'fade' | 'slide' | 'zoom'
          layout_template?: string
          randomize_order?: boolean
          allow_video_finish?: boolean
          require_email?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          project_id: string
          full_name: string
          social_handle: string | null
          email: string | null
          comment: string
          photo_url: string | null
          video_url: string | null
          status: 'pending' | 'approved' | 'declined' | 'deleted' | 'archived'
          display_mode: 'once' | 'repeat'
          custom_timing: number | null
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          full_name: string
          social_handle?: string | null
          email?: string | null
          comment: string
          photo_url?: string | null
          video_url?: string | null
          status?: 'pending' | 'approved' | 'declined' | 'deleted' | 'archived'
          display_mode?: 'once' | 'repeat'
          custom_timing?: number | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          full_name?: string
          social_handle?: string | null
          email?: string | null
          comment?: string
          photo_url?: string | null
          video_url?: string | null
          status?: 'pending' | 'approved' | 'declined' | 'deleted' | 'archived'
          display_mode?: 'once' | 'repeat'
          custom_timing?: number | null
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
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
  }
}
