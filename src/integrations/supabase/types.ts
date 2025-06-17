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
      agenda_items: {
        Row: {
          block: string
          description: string
          id: string
          key: string | null
          notes: string | null
          order_position: number
          scale_id: string
          time: string
        }
        Insert: {
          block: string
          description: string
          id?: string
          key?: string | null
          notes?: string | null
          order_position: number
          scale_id: string
          time: string
        }
        Update: {
          block?: string
          description?: string
          id?: string
          key?: string | null
          notes?: string | null
          order_position?: number
          scale_id?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_items_scale_id_fkey"
            columns: ["scale_id"]
            isOneToOne: false
            referencedRelation: "scales"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          address: string | null
          admin_id: string
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          service_types: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admin_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          service_types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admin_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          service_types?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "churches_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          order_position: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_position: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          order_position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          church_id: string
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          instructor_id: string | null
          is_active: boolean | null
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          church_id: string
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          instructor_id?: string | null
          is_active?: boolean | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          church_id?: string
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          instructor_id?: string | null
          is_active?: boolean | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          church_id: string
          created_at: string | null
          id: string
          is_sub_department: boolean | null
          leader_id: string | null
          name: string
          parent_department_id: string | null
          type: Database["public"]["Enums"]["department_type"]
        }
        Insert: {
          church_id: string
          created_at?: string | null
          id?: string
          is_sub_department?: boolean | null
          leader_id?: string | null
          name: string
          parent_department_id?: string | null
          type: Database["public"]["Enums"]["department_type"]
        }
        Update: {
          church_id?: string
          created_at?: string | null
          id?: string
          is_sub_department?: boolean | null
          leader_id?: string | null
          name?: string
          parent_department_id?: string | null
          type?: Database["public"]["Enums"]["department_type"]
        }
        Relationships: [
          {
            foreignKeyName: "departments_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      event_guests: {
        Row: {
          created_at: string | null
          document: string | null
          email: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          document?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          document?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attendee_id: string
          attendee_type: string
          checked_in: boolean | null
          checked_in_at: string | null
          checked_in_by: string | null
          event_id: string
          id: string
          qr_code: string
          registered_at: string | null
        }
        Insert: {
          attendee_id: string
          attendee_type: string
          checked_in?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          event_id: string
          id?: string
          qr_code: string
          registered_at?: string | null
        }
        Update: {
          attendee_id?: string
          attendee_type?: string
          checked_in?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          event_id?: string
          id?: string
          qr_code?: string
          registered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          church_id: string
          created_at: string | null
          created_by: string
          date: string
          description: string | null
          id: string
          image: string | null
          is_public: boolean | null
          location: string | null
          max_attendees: number | null
          qr_readers: string[] | null
          registration_deadline: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          church_id: string
          created_at?: string | null
          created_by: string
          date: string
          description?: string | null
          id?: string
          image?: string | null
          is_public?: boolean | null
          location?: string | null
          max_attendees?: number | null
          qr_readers?: string[] | null
          registration_deadline?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          church_id?: string
          created_at?: string | null
          created_by?: string
          date?: string
          description?: string | null
          id?: string
          image?: string | null
          is_public?: boolean | null
          location?: string | null
          max_attendees?: number | null
          qr_readers?: string[] | null
          registration_deadline?: string | null
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          church_id: string
          created_at: string | null
          department_id: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["invite_status"] | null
        }
        Insert: {
          church_id: string
          created_at?: string | null
          department_id?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invite_status"] | null
        }
        Update: {
          church_id?: string
          created_at?: string | null
          department_id?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invite_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_files: {
        Row: {
          id: string
          lesson_id: string
          name: string
          size: number
          type: Database["public"]["Enums"]["file_type"]
          uploaded_at: string | null
          url: string
        }
        Insert: {
          id?: string
          lesson_id: string
          name: string
          size: number
          type: Database["public"]["Enums"]["file_type"]
          uploaded_at?: string | null
          url: string
        }
        Update: {
          id?: string
          lesson_id?: string
          name?: string
          size?: number
          type?: Database["public"]["Enums"]["file_type"]
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_files_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string | null
          duration: number | null
          id: string
          module_id: string
          order_position: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          module_id: string
          order_position: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          module_id?: string
          order_position?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      member_evaluations: {
        Row: {
          church_id: string
          commitment: number | null
          created_at: string | null
          department_id: string | null
          evaluation_date: string | null
          evaluator_id: string
          id: string
          leadership_skills: number | null
          member_id: string
          notes: string | null
          overall_rating: number | null
          punctuality: number | null
          teamwork: number | null
          technical_skills: number | null
          updated_at: string | null
        }
        Insert: {
          church_id: string
          commitment?: number | null
          created_at?: string | null
          department_id?: string | null
          evaluation_date?: string | null
          evaluator_id: string
          id?: string
          leadership_skills?: number | null
          member_id: string
          notes?: string | null
          overall_rating?: number | null
          punctuality?: number | null
          teamwork?: number | null
          technical_skills?: number | null
          updated_at?: string | null
        }
        Update: {
          church_id?: string
          commitment?: number | null
          created_at?: string | null
          department_id?: string | null
          evaluation_date?: string | null
          evaluator_id?: string
          id?: string
          leadership_skills?: number | null
          member_id?: string
          notes?: string | null
          overall_rating?: number | null
          punctuality?: number | null
          teamwork?: number | null
          technical_skills?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_evaluations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_evaluations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_evaluations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_history: {
        Row: {
          action_type: string
          changed_by: string
          church_id: string
          created_at: string | null
          department_id: string | null
          id: string
          metadata: Json | null
          new_role: string | null
          notes: string | null
          previous_department_id: string | null
          previous_role: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          changed_by: string
          church_id: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          metadata?: Json | null
          new_role?: string | null
          notes?: string | null
          previous_department_id?: string | null
          previous_role?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          changed_by?: string
          church_id?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          metadata?: Json | null
          new_role?: string | null
          notes?: string | null
          previous_department_id?: string | null
          previous_role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_history_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_history_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          dark_mode: boolean | null
          email: string
          experience: string | null
          id: string
          language: string | null
          name: string
          phone: string | null
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          email: string
          experience?: string | null
          id: string
          language?: string | null
          name: string
          phone?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          dark_mode?: boolean | null
          email?: string
          experience?: string | null
          id?: string
          language?: string | null
          name?: string
          phone?: string | null
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scale_collaborators: {
        Row: {
          confirmed: boolean | null
          id: string
          invited_at: string | null
          role: string
          scale_id: string
          user_id: string
        }
        Insert: {
          confirmed?: boolean | null
          id?: string
          invited_at?: string | null
          role: string
          scale_id: string
          user_id: string
        }
        Update: {
          confirmed?: boolean | null
          id?: string
          invited_at?: string | null
          role?: string
          scale_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scale_collaborators_scale_id_fkey"
            columns: ["scale_id"]
            isOneToOne: false
            referencedRelation: "scales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scale_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scale_songs: {
        Row: {
          id: string
          links: string[] | null
          notes: string | null
          order_position: number
          original_key: string | null
          scale_id: string
          scale_key: string | null
          song_id: string
        }
        Insert: {
          id?: string
          links?: string[] | null
          notes?: string | null
          order_position: number
          original_key?: string | null
          scale_id: string
          scale_key?: string | null
          song_id: string
        }
        Update: {
          id?: string
          links?: string[] | null
          notes?: string | null
          order_position?: number
          original_key?: string | null
          scale_id?: string
          scale_key?: string | null
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scale_songs_scale_id_fkey"
            columns: ["scale_id"]
            isOneToOne: false
            referencedRelation: "scales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scale_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      scales: {
        Row: {
          church_id: string
          created_at: string | null
          created_by: string
          date: string
          department_id: string
          id: string
          notes: string | null
          service_type: string
          status: Database["public"]["Enums"]["scale_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          church_id: string
          created_at?: string | null
          created_by: string
          date: string
          department_id: string
          id?: string
          notes?: string | null
          service_type: string
          status?: Database["public"]["Enums"]["scale_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          church_id?: string
          created_at?: string | null
          created_by?: string
          date?: string
          department_id?: string
          id?: string
          notes?: string | null
          service_type?: string
          status?: Database["public"]["Enums"]["scale_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scales_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scales_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scales_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          added_by: string
          artist: string
          bpm: number | null
          church_id: string
          cifra_url: string | null
          created_at: string | null
          genre: string | null
          id: string
          key: string | null
          lyrics: string | null
          spotify_url: string | null
          tags: string[] | null
          tempo: string | null
          title: string
          youtube_url: string | null
        }
        Insert: {
          added_by: string
          artist: string
          bpm?: number | null
          church_id: string
          cifra_url?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          lyrics?: string | null
          spotify_url?: string | null
          tags?: string[] | null
          tempo?: string | null
          title: string
          youtube_url?: string | null
        }
        Update: {
          added_by?: string
          artist?: string
          bpm?: number | null
          church_id?: string
          cifra_url?: string | null
          created_at?: string | null
          genre?: string | null
          id?: string
          key?: string | null
          lyrics?: string | null
          spotify_url?: string | null
          tags?: string[] | null
          tempo?: string | null
          title?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          completed_lessons: string[] | null
          course_id: string
          enrolled_at: string | null
          id: string
          progress: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_lessons?: string[] | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_lessons?: string[] | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_departments: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_departments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          church_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          church_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          church_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role_in_church: {
        Args: { church_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_church_access: {
        Args: { church_uuid: string }
        Returns: boolean
      }
      is_master: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      department_type:
        | "louvor"
        | "louvor-juniores"
        | "louvor-teens"
        | "midia"
        | "midia-juniores"
        | "sonoplastia"
        | "instrumentos"
        | "recepcao"
        | "ministracao"
        | "palavra"
        | "oracao"
        | "custom"
      event_status: "draft" | "published" | "cancelled" | "completed"
      file_type: "pdf" | "doc" | "image" | "video" | "audio" | "other"
      invite_status: "pending" | "accepted" | "expired" | "declined"
      scale_status: "draft" | "published" | "completed"
      user_role: "master" | "admin" | "leader" | "collaborator" | "member"
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
      department_type: [
        "louvor",
        "louvor-juniores",
        "louvor-teens",
        "midia",
        "midia-juniores",
        "sonoplastia",
        "instrumentos",
        "recepcao",
        "ministracao",
        "palavra",
        "oracao",
        "custom",
      ],
      event_status: ["draft", "published", "cancelled", "completed"],
      file_type: ["pdf", "doc", "image", "video", "audio", "other"],
      invite_status: ["pending", "accepted", "expired", "declined"],
      scale_status: ["draft", "published", "completed"],
      user_role: ["master", "admin", "leader", "collaborator", "member"],
    },
  },
} as const
