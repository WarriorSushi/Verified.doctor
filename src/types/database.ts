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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_identifier: string
          created_at: string | null
          details: Json | null
          id: string
          target_profile_id: string | null
        }
        Insert: {
          action_type: string
          admin_identifier: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_profile_id?: string | null
        }
        Update: {
          action_type?: string
          admin_identifier?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_ip: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_ip?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_ip?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      analytics_daily_stats: {
        Row: {
          click_book_appointment: number | null
          click_recommend: number | null
          click_save_contact: number | null
          click_send_inquiry: number | null
          created_at: string | null
          date: string
          desktop_views: number | null
          id: string
          inquiries_received: number | null
          mobile_views: number | null
          profile_id: string | null
          recommendations_received: number | null
          tablet_views: number | null
          total_views: number | null
          unique_views: number | null
          updated_at: string | null
          verified_doctor_views: number | null
        }
        Insert: {
          click_book_appointment?: number | null
          click_recommend?: number | null
          click_save_contact?: number | null
          click_send_inquiry?: number | null
          created_at?: string | null
          date: string
          desktop_views?: number | null
          id?: string
          inquiries_received?: number | null
          mobile_views?: number | null
          profile_id?: string | null
          recommendations_received?: number | null
          tablet_views?: number | null
          total_views?: number | null
          unique_views?: number | null
          updated_at?: string | null
          verified_doctor_views?: number | null
        }
        Update: {
          click_book_appointment?: number | null
          click_recommend?: number | null
          click_save_contact?: number | null
          click_send_inquiry?: number | null
          created_at?: string | null
          date?: string
          desktop_views?: number | null
          id?: string
          inquiries_received?: number | null
          mobile_views?: number | null
          profile_id?: string | null
          recommendations_received?: number | null
          tablet_views?: number | null
          total_views?: number | null
          unique_views?: number | null
          updated_at?: string | null
          verified_doctor_views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_daily_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          is_verified_viewer: boolean | null
          profile_id: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          viewer_profile_id: string | null
          visitor_id: string | null
          visitor_ip: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          is_verified_viewer?: boolean | null
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewer_profile_id?: string | null
          visitor_id?: string | null
          visitor_ip?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          is_verified_viewer?: boolean | null
          profile_id?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewer_profile_id?: string | null
          visitor_id?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_viewer_profile_id_fkey"
            columns: ["viewer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appeals: {
        Row: {
          admin_response: string | null
          created_at: string | null
          id: string
          message: string
          profile_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          message: string
          profile_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          message?: string
          profile_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appeals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_email_log: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          profile_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template_slug: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          profile_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status: string
          subject: string
          template_slug: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          profile_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_email_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_email_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          profile_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          template_slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          template_slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          profile_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          template_slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_email_queue_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          requester_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          requester_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          replied_at: string | null
          status: string
          subject: string | null
          type: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          replied_at?: string | null
          status?: string
          subject?: string | null
          type?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          replied_at?: string | null
          status?: string
          subject?: string | null
          type?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          invite_code: string
          invitee_email: string | null
          inviter_profile_id: string
          used: boolean | null
          used_by_profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code: string
          invitee_email?: string | null
          inviter_profile_id: string
          used?: boolean | null
          used_by_profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          invitee_email?: string | null
          inviter_profile_id?: string
          used?: boolean | null
          used_by_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_inviter_profile_id_fkey"
            columns: ["inviter_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_used_by_profile_id_fkey"
            columns: ["used_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          admin_sender_name: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_admin_message: boolean | null
          is_pinned: boolean | null
          is_read: boolean | null
          message_content: string
          profile_id: string
          reply_content: string | null
          reply_sent_at: string | null
          sender_name: string
          sender_phone: string
        }
        Insert: {
          admin_sender_name?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_admin_message?: boolean | null
          is_pinned?: boolean | null
          is_read?: boolean | null
          message_content: string
          profile_id: string
          reply_content?: string | null
          reply_sent_at?: string | null
          sender_name: string
          sender_phone: string
        }
        Update: {
          admin_sender_name?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_admin_message?: boolean | null
          is_pinned?: boolean | null
          is_read?: boolean | null
          message_content?: string
          profile_id?: string
          reply_content?: string | null
          reply_sent_at?: string | null
          sender_name?: string
          sender_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          profile_id: string
          viewed_at: string | null
          viewer_ip: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          viewed_at?: string | null
          viewer_ip?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          viewed_at?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievement_badges: Json | null
          ai_suggestions_reset_at: string | null
          ai_suggestions_used_this_month: number | null
          approach_to_care: string | null
          availability_note: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          bio: string | null
          case_studies: Json | null
          clinic_gallery: Json | null
          clinic_location: string | null
          clinic_name: string | null
          conditions_treated: string | null
          connection_count: number | null
          consultation_fee: string | null
          created_at: string | null
          dismissed_notifications: Json | null
          education_timeline: Json | null
          external_booking_url: string | null
          first_visit_guide: string | null
          frozen_at: string | null
          full_name: string
          handle: string
          hospital_affiliations: Json | null
          id: string
          initial_boost_amount: number | null
          initial_boost_applied: boolean | null
          initial_boost_applied_at: string | null
          is_available: boolean | null
          is_banned: boolean | null
          is_frozen: boolean | null
          is_verified: boolean | null
          languages: string | null
          media_publications: Json | null
          messages_received_this_month: number | null
          messages_reset_at: string | null
          offers_telemedicine: boolean | null
          procedures_performed: string | null
          professional_memberships: Json | null
          profile_layout: string | null
          profile_photo_url: string | null
          profile_template: string | null
          profile_theme: string | null
          qualifications: string | null
          recommendation_count: number | null
          registration_number: string | null
          section_visibility: Json | null
          services: string | null
          specialty: string | null
          subscription_cancelled_at: string | null
          subscription_expires_at: string | null
          subscription_id: string | null
          subscription_plan: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          trial_expires_at: string | null
          trial_invites_completed: number | null
          trial_invites_required: number | null
          trial_offer_shown_at: string | null
          trial_started_at: string | null
          trial_status: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          video_introduction_url: string | null
          view_count: number | null
          years_experience: number | null
        }
        Insert: {
          achievement_badges?: Json | null
          ai_suggestions_reset_at?: string | null
          ai_suggestions_used_this_month?: number | null
          approach_to_care?: string | null
          availability_note?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          case_studies?: Json | null
          clinic_gallery?: Json | null
          clinic_location?: string | null
          clinic_name?: string | null
          conditions_treated?: string | null
          connection_count?: number | null
          consultation_fee?: string | null
          created_at?: string | null
          dismissed_notifications?: Json | null
          education_timeline?: Json | null
          external_booking_url?: string | null
          first_visit_guide?: string | null
          frozen_at?: string | null
          full_name: string
          handle: string
          hospital_affiliations?: Json | null
          id?: string
          initial_boost_amount?: number | null
          initial_boost_applied?: boolean | null
          initial_boost_applied_at?: string | null
          is_available?: boolean | null
          is_banned?: boolean | null
          is_frozen?: boolean | null
          is_verified?: boolean | null
          languages?: string | null
          media_publications?: Json | null
          messages_received_this_month?: number | null
          messages_reset_at?: string | null
          offers_telemedicine?: boolean | null
          procedures_performed?: string | null
          professional_memberships?: Json | null
          profile_layout?: string | null
          profile_photo_url?: string | null
          profile_template?: string | null
          profile_theme?: string | null
          qualifications?: string | null
          recommendation_count?: number | null
          registration_number?: string | null
          section_visibility?: Json | null
          services?: string | null
          specialty?: string | null
          subscription_cancelled_at?: string | null
          subscription_expires_at?: string | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          trial_expires_at?: string | null
          trial_invites_completed?: number | null
          trial_invites_required?: number | null
          trial_offer_shown_at?: string | null
          trial_started_at?: string | null
          trial_status?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          video_introduction_url?: string | null
          view_count?: number | null
          years_experience?: number | null
        }
        Update: {
          achievement_badges?: Json | null
          ai_suggestions_reset_at?: string | null
          ai_suggestions_used_this_month?: number | null
          approach_to_care?: string | null
          availability_note?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          case_studies?: Json | null
          clinic_gallery?: Json | null
          clinic_location?: string | null
          clinic_name?: string | null
          conditions_treated?: string | null
          connection_count?: number | null
          consultation_fee?: string | null
          created_at?: string | null
          dismissed_notifications?: Json | null
          education_timeline?: Json | null
          external_booking_url?: string | null
          first_visit_guide?: string | null
          frozen_at?: string | null
          full_name?: string
          handle?: string
          hospital_affiliations?: Json | null
          id?: string
          initial_boost_amount?: number | null
          initial_boost_applied?: boolean | null
          initial_boost_applied_at?: string | null
          is_available?: boolean | null
          is_banned?: boolean | null
          is_frozen?: boolean | null
          is_verified?: boolean | null
          languages?: string | null
          media_publications?: Json | null
          messages_received_this_month?: number | null
          messages_reset_at?: string | null
          offers_telemedicine?: boolean | null
          procedures_performed?: string | null
          professional_memberships?: Json | null
          profile_layout?: string | null
          profile_photo_url?: string | null
          profile_template?: string | null
          profile_theme?: string | null
          qualifications?: string | null
          recommendation_count?: number | null
          registration_number?: string | null
          section_visibility?: Json | null
          services?: string | null
          specialty?: string | null
          subscription_cancelled_at?: string | null
          subscription_expires_at?: string | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          trial_expires_at?: string | null
          trial_invites_completed?: number | null
          trial_invites_required?: number | null
          trial_offer_shown_at?: string | null
          trial_started_at?: string | null
          trial_status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          video_introduction_url?: string | null
          view_count?: number | null
          years_experience?: number | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string | null
          fingerprint: string
          id: string
          ip_address: string | null
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          fingerprint: string
          id?: string
          ip_address?: string | null
          profile_id: string
        }
        Update: {
          created_at?: string | null
          fingerprint?: string
          id?: string
          ip_address?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          dodo_event_id: string | null
          dodo_subscription_id: string | null
          event_type: string
          id: string
          metadata: Json | null
          profile_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          dodo_event_id?: string | null
          dodo_subscription_id?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          profile_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          dodo_event_id?: string | null
          dodo_subscription_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          id: string
          profile_id: string
          subject: string
          message: string
          status: string
          admin_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          subject: string
          message: string
          status?: string
          admin_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          subject?: string
          message?: string
          status?: string
          admin_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_invites: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          invite_code: string
          invitee_profile_id: string | null
          profile_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          invite_code: string
          invitee_profile_id?: string | null
          profile_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          invite_code?: string
          invitee_profile_id?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trial_invites_invitee_profile_id_fkey"
            columns: ["invitee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trial_invites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lifecycle_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_lifecycle_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          document_url: string
          id: string
          profile_id: string
          uploaded_at: string | null
        }
        Insert: {
          document_url: string
          id?: string
          profile_id: string
          uploaded_at?: string | null
        }
        Update: {
          document_url?: string
          id?: string
          profile_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_profile_id_fkey"
            columns: ["profile_id"]
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
      current_user_id: { Args: never; Returns: string }
      decrement_connection_count: {
        Args: { profile_uuid: string }
        Returns: undefined
      }
      increment_connection_count: {
        Args: { profile_uuid: string }
        Returns: undefined
      }
      increment_connection_counts: {
        Args: { profile1_uuid: string; profile2_uuid: string }
        Returns: undefined
      }
      increment_recommendation_count: {
        Args: { profile_uuid: string }
        Returns: undefined
      }
      increment_view_count: {
        Args: { profile_uuid: string }
        Returns: undefined
      }
      increment_messages_received: {
        Args: { p_profile_id: string }
        Returns: undefined
      }
      increment_ai_suggestions_used: {
        Args: { p_profile_id: string }
        Returns: undefined
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

// Convenience type alias for profiles table row
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
