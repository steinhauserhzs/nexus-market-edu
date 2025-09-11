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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
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
      admin_permissions: {
        Row: {
          admin_id: string
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string
          id: string
          permission_type: string
          resource: string | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string
          id?: string
          permission_type: string
          resource?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string
          id?: string
          permission_type?: string
          resource?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          created_at: string | null
          default_commission_pct: number | null
          id: string
          status: string | null
          store_id: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_code: string
          created_at?: string | null
          default_commission_pct?: number | null
          id?: string
          status?: string | null
          store_id?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_code?: string
          created_at?: string | null
          default_commission_pct?: number | null
          id?: string
          status?: string | null
          store_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_analytics: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          product_id: string | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          product_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          product_id?: string | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          metadata: Json | null
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          metadata?: Json | null
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          metadata?: Json | null
          room_id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          id: string
          joined_at: string
          last_seen: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_seen?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_seen?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean
          name: string
          store_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean
          name: string
          store_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean
          name?: string
          store_id?: string
        }
        Relationships: []
      }
      checkout_sessions: {
        Row: {
          cancel_url: string | null
          completed_at: string | null
          created_at: string
          id: string
          products: Json
          status: string | null
          stripe_session_id: string | null
          success_url: string | null
          total_amount_cents: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_url?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          products: Json
          status?: string | null
          stripe_session_id?: string | null
          success_url?: string | null
          total_amount_cents: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_url?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          products?: Json
          status?: string | null
          stripe_session_id?: string | null
          success_url?: string | null
          total_amount_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      code_reviews: {
        Row: {
          created_at: string
          critical_issues: number
          file_name: string
          high_issues: number
          id: string
          issues_found: number
          low_issues: number
          medium_issues: number
          overall_score: number
          review_data: Json
          review_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          critical_issues?: number
          file_name: string
          high_issues?: number
          id?: string
          issues_found?: number
          low_issues?: number
          medium_issues?: number
          overall_score?: number
          review_data?: Json
          review_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          critical_issues?: number
          file_name?: string
          high_issues?: number
          id?: string
          issues_found?: number
          low_issues?: number
          medium_issues?: number
          overall_score?: number
          review_data?: Json
          review_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          comments_count: number
          content: string
          content_id: string | null
          created_at: string
          id: string
          is_pinned: boolean
          likes_count: number
          store_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          content_id?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          likes_count?: number
          store_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          content_id?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          likes_count?: number
          store_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          created_at: string
          discount_applied_cents: number
          id: string
          order_id: string | null
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount_applied_cents: number
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount_applied_cents?: number
          id?: string
          order_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          maximum_discount_cents: number | null
          minimum_order_cents: number | null
          name: string
          product_ids: string[] | null
          store_id: string | null
          updated_at: string
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          maximum_discount_cents?: number | null
          minimum_order_cents?: number | null
          name: string
          product_ids?: string[] | null
          store_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          maximum_discount_cents?: number | null
          minimum_order_cents?: number | null
          name?: string
          product_ids?: string[] | null
          store_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      data_retention_policies: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          retention_days: number
          retention_field: string
          table_name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          retention_days: number
          retention_field?: string
          table_name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          retention_days?: number
          retention_field?: string
          table_name?: string
        }
        Relationships: []
      }
      event_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          event_id: string
          id: string
          image_url: string
          is_primary: boolean | null
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          is_active: boolean | null
          name: string
          price_cents: number
          quantity_available: number
          quantity_sold: number
          sale_end_date: string | null
          sale_start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          is_active?: boolean | null
          name: string
          price_cents?: number
          quantity_available?: number
          quantity_sold?: number
          sale_end_date?: string | null
          sale_start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          quantity_available?: number
          quantity_sold?: number
          sale_end_date?: string | null
          sale_start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_restriction: string | null
          banner_url: string | null
          category: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          is_featured: boolean | null
          max_capacity: number | null
          organizer_id: string
          price_from: number | null
          status: Database["public"]["Enums"]["event_status"] | null
          terms_and_conditions: string | null
          ticket_sales_end_date: string | null
          ticket_sales_start_date: string | null
          title: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          age_restriction?: string | null
          banner_url?: string | null
          category: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          is_featured?: boolean | null
          max_capacity?: number | null
          organizer_id: string
          price_from?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          terms_and_conditions?: string | null
          ticket_sales_end_date?: string | null
          ticket_sales_start_date?: string | null
          title: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          age_restriction?: string | null
          banner_url?: string | null
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          is_featured?: boolean | null
          max_capacity?: number | null
          organizer_id?: string
          price_from?: number | null
          status?: Database["public"]["Enums"]["event_status"] | null
          terms_and_conditions?: string | null
          ticket_sales_end_date?: string | null
          ticket_sales_start_date?: string | null
          title?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues_public"
            referencedColumns: ["id"]
          },
        ]
      }
      file_upload_audit: {
        Row: {
          created_at: string
          file_name: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          rejection_reason: string | null
          sanitized_name: string | null
          security_warnings: string[] | null
          upload_status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          sanitized_name?: string | null
          security_warnings?: string[] | null
          upload_status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          sanitized_name?: string | null
          security_warnings?: string[] | null
          upload_status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          created_at: string
          id: string
          period: string
          points: number
          rank: number
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period?: string
          points?: number
          rank?: number
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period?: string
          points?: number
          rank?: number
          store_id?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string | null
          progress_seconds: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          progress_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          progress_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          is_preview: boolean | null
          module_id: string | null
          resources: Json | null
          sort_order: number
          title: string
          video_duration_seconds: number | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_preview?: boolean | null
          module_id?: string | null
          resources?: Json | null
          sort_order?: number
          title: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_preview?: boolean | null
          module_id?: string | null
          resources?: Json | null
          sort_order?: number
          title?: string
          video_duration_seconds?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          order_id: string | null
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          order_id?: string | null
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          order_id?: string | null
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_area_configs: {
        Row: {
          created_at: string
          custom_logo_url: string | null
          exclusive_content: Json | null
          id: string
          is_active: boolean | null
          member_resources: Json | null
          primary_color: string | null
          secondary_color: string | null
          show_other_products: boolean | null
          show_progress_tracking: boolean | null
          store_id: string
          updated_at: string
          welcome_message: string | null
          welcome_video_url: string | null
        }
        Insert: {
          created_at?: string
          custom_logo_url?: string | null
          exclusive_content?: Json | null
          id?: string
          is_active?: boolean | null
          member_resources?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          show_other_products?: boolean | null
          show_progress_tracking?: boolean | null
          store_id: string
          updated_at?: string
          welcome_message?: string | null
          welcome_video_url?: string | null
        }
        Update: {
          created_at?: string
          custom_logo_url?: string | null
          exclusive_content?: Json | null
          id?: string
          is_active?: boolean | null
          member_resources?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          show_other_products?: boolean | null
          show_progress_tracking?: boolean | null
          store_id?: string
          updated_at?: string
          welcome_message?: string | null
          welcome_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_area_configs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      member_area_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          layout_config: Json
          name: string
          preview_image: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          layout_config?: Json
          name: string
          preview_image?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          layout_config?: Json
          name?: string
          preview_image?: string | null
        }
        Relationships: []
      }
      member_exclusive_content: {
        Row: {
          content: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          requires_product_ids: string[] | null
          sort_order: number | null
          store_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          requires_product_ids?: string[] | null
          sort_order?: number | null
          store_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          requires_product_ids?: string[] | null
          sort_order?: number | null
          store_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_exclusive_content_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string | null
          replied_to_id: string | null
          sender_id: string | null
          store_id: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string | null
          replied_to_id?: string | null
          sender_id?: string | null
          store_id?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string | null
          replied_to_id?: string | null
          sender_id?: string | null
          store_id?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_replied_to_id_fkey"
            columns: ["replied_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          product_id: string | null
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          product_id?: string | null
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          product_id?: string | null
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          store_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          store_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          store_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          affiliate_share_cents: number | null
          created_at: string | null
          id: string
          order_id: string | null
          platform_share_cents: number | null
          product_id: string | null
          quantity: number
          seller_share_cents: number | null
          unit_price_cents: number
        }
        Insert: {
          affiliate_share_cents?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          platform_share_cents?: number | null
          product_id?: string | null
          quantity?: number
          seller_share_cents?: number | null
          unit_price_cents: number
        }
        Update: {
          affiliate_share_cents?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          platform_share_cents?: number | null
          product_id?: string | null
          quantity?: number
          seller_share_cents?: number | null
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          external_order_id: string | null
          gateway: string | null
          gateway_payment_id: string | null
          gateway_session_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_provider: string | null
          payment_status: string | null
          shipping_address: Json | null
          status: string | null
          stripe_payment_intent_id: string | null
          total_cents: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_order_id?: string | null
          gateway?: string | null
          gateway_payment_id?: string | null
          gateway_session_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_cents: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          external_order_id?: string | null
          gateway?: string | null
          gateway_payment_id?: string | null
          gateway_session_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_cents?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_info_audit: {
        Row: {
          accessed_user_id: string
          action: string
          audit_timestamp: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          session_id: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_user_id: string
          action: string
          audit_timestamp?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_user_id?: string
          action?: string
          audit_timestamp?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_commissions: {
        Row: {
          affiliate_id: string | null
          commission_pct: number
          id: string
          product_id: string | null
        }
        Insert: {
          affiliate_id?: string | null
          commission_pct: number
          id?: string
          product_id?: string | null
        }
        Update: {
          affiliate_id?: string | null
          commission_pct?: number
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_commissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_votes: number | null
          id: string
          product_id: string | null
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_votes?: number | null
          id?: string
          product_id?: string | null
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_votes?: number | null
          id?: string
          product_id?: string | null
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          product_id: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          product_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          product_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_affiliates: boolean | null
          category_id: string | null
          compare_price_cents: number | null
          created_at: string | null
          currency: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          difficulty_level: string | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          price_cents: number
          product_files: Json | null
          requires_shipping: boolean | null
          slug: string
          status: string | null
          store_id: string | null
          thumbnail_url: string | null
          title: string
          total_duration_minutes: number | null
          total_lessons: number | null
          type: string | null
          updated_at: string | null
          weight_grams: number | null
        }
        Insert: {
          allow_affiliates?: boolean | null
          category_id?: string | null
          compare_price_cents?: number | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          price_cents?: number
          product_files?: Json | null
          requires_shipping?: boolean | null
          slug: string
          status?: string | null
          store_id?: string | null
          thumbnail_url?: string | null
          title: string
          total_duration_minutes?: number | null
          total_lessons?: number | null
          type?: string | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Update: {
          allow_affiliates?: boolean | null
          category_id?: string | null
          compare_price_cents?: number | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          price_cents?: number
          product_files?: Json | null
          requires_shipping?: boolean | null
          slug?: string
          status?: string | null
          store_id?: string | null
          thumbnail_url?: string | null
          title?: string
          total_duration_minutes?: number | null
          total_lessons?: number | null
          type?: string | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          company: string | null
          company_name: string | null
          country: string | null
          cpf: string | null
          cpf_verified: boolean | null
          created_at: string | null
          data_consent_date: string | null
          data_consent_given: boolean | null
          data_processing_consent: boolean | null
          email: string
          email_notifications: boolean | null
          email_verified: boolean | null
          full_name: string | null
          gender: string | null
          id: string
          is_verified: boolean | null
          last_login_at: string | null
          linkedin_url: string | null
          login_method: string | null
          marketing_consent: boolean | null
          marketing_emails: boolean | null
          phone: string | null
          phone_verified: boolean | null
          pix_key: string | null
          postal_code: string | null
          preferred_language: string | null
          profession: string | null
          profile_visibility: string | null
          role: string | null
          seller_slug: string | null
          sms_notifications: boolean | null
          state: string | null
          tax_id: string | null
          timezone: string | null
          updated_at: string | null
          website_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          company_name?: string | null
          country?: string | null
          cpf?: string | null
          cpf_verified?: boolean | null
          created_at?: string | null
          data_consent_date?: string | null
          data_consent_given?: boolean | null
          data_processing_consent?: boolean | null
          email: string
          email_notifications?: boolean | null
          email_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_verified?: boolean | null
          last_login_at?: string | null
          linkedin_url?: string | null
          login_method?: string | null
          marketing_consent?: boolean | null
          marketing_emails?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          pix_key?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          profession?: string | null
          profile_visibility?: string | null
          role?: string | null
          seller_slug?: string | null
          sms_notifications?: boolean | null
          state?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          company_name?: string | null
          country?: string | null
          cpf?: string | null
          cpf_verified?: boolean | null
          created_at?: string | null
          data_consent_date?: string | null
          data_consent_given?: boolean | null
          data_processing_consent?: boolean | null
          email?: string
          email_notifications?: boolean | null
          email_verified?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_verified?: boolean | null
          last_login_at?: string | null
          linkedin_url?: string | null
          login_method?: string | null
          marketing_consent?: boolean | null
          marketing_emails?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          pix_key?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          profession?: string | null
          profile_visibility?: string | null
          role?: string | null
          seller_slug?: string | null
          sms_notifications?: boolean | null
          state?: string | null
          tax_id?: string | null
          timezone?: string | null
          updated_at?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      security_audit: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          record_id: string | null
          risk_level: string | null
          session_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          risk_level?: string | null
          session_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          record_id?: string | null
          risk_level?: string | null
          session_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          session_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seller_payment_info: {
        Row: {
          bank_account: Json | null
          created_at: string | null
          id: string
          pix_key: string | null
          stripe_account_id: string | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          bank_account?: Json | null
          created_at?: string | null
          id?: string
          pix_key?: string | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          bank_account?: Json | null
          created_at?: string | null
          id?: string
          pix_key?: string | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      store_assets: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          mime_type: string
          store_id: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          mime_type: string
          store_id: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          mime_type?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_assets_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_components: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_template: boolean
          name: string
          preview_image: string | null
          store_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_template?: boolean
          name: string
          preview_image?: string | null
          store_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_template?: boolean
          name?: string
          preview_image?: string | null
          store_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_components_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_followers: {
        Row: {
          created_at: string
          id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: []
      }
      store_pages: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
          sort_order: number
          store_id: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
          sort_order?: number
          store_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
          sort_order?: number
          store_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_pages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          banner_url: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          niche: string | null
          owner_id: string | null
          parent_store_id: string | null
          slug: string
          support_channel_url: string | null
          theme: Json | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          niche?: string | null
          owner_id?: string | null
          parent_store_id?: string | null
          slug: string
          support_channel_url?: string | null
          theme?: Json | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          niche?: string | null
          owner_id?: string | null
          parent_store_id?: string | null
          slug?: string
          support_channel_url?: string | null
          theme?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_parent_store_id_fkey"
            columns: ["parent_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configs: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_cents: number
          buyer_id: string | null
          created_at: string | null
          id: string
          order_id: string | null
          platform_fee_cents: number | null
          processed_at: string | null
          product_id: string | null
          seller_amount_cents: number
          seller_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_cents: number
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          platform_fee_cents?: number | null
          processed_at?: string | null
          product_id?: string | null
          seller_amount_cents: number
          seller_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_cents?: number
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          platform_fee_cents?: number | null
          processed_at?: string | null
          product_id?: string | null
          seller_amount_cents?: number
          seller_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_sessions: {
        Row: {
          chunks_total: number
          chunks_uploaded: number | null
          created_at: string | null
          file_name: string
          file_size: number
          final_url: string | null
          id: string
          status: string | null
          store_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chunks_total: number
          chunks_uploaded?: number | null
          created_at?: string | null
          file_name: string
          file_size: number
          final_url?: string | null
          id?: string
          status?: string | null
          store_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chunks_total?: number
          chunks_uploaded?: number | null
          created_at?: string | null
          file_name?: string
          file_size?: number
          final_url?: string | null
          id?: string
          status?: string | null
          store_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upload_sessions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          badge_icon: string | null
          description: string | null
          earned_at: string
          id: string
          points_awarded: number
          store_id: string
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          badge_icon?: string | null
          description?: string | null
          earned_at?: string
          id?: string
          points_awarded?: number
          store_id: string
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["achievement_type"]
          badge_icon?: string | null
          description?: string | null
          earned_at?: string
          id?: string
          points_awarded?: number
          store_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string
          experience: number
          id: string
          level: number
          store_id: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience?: number
          id?: string
          level?: number
          store_id: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience?: number
          id?: string
          level?: number
          store_id?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          accessibility_features: string[] | null
          address: string
          capacity: number | null
          city: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          facilities: string[] | null
          id: string
          name: string
          parking_available: boolean | null
          state: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          accessibility_features?: string[] | null
          address: string
          capacity?: number | null
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          facilities?: string[] | null
          id?: string
          name: string
          parking_available?: boolean | null
          state: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          accessibility_features?: string[] | null
          address?: string
          capacity?: number | null
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          facilities?: string[] | null
          id?: string
          name?: string
          parking_available?: boolean | null
          state?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          attempts: number
          code: string
          contact_value: string
          created_at: string
          expires_at: string
          id: string
          is_used: boolean
          type: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          code: string
          contact_value: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          type: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          code?: string
          contact_value?: string
          created_at?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          type?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_notifications: {
        Row: {
          attempts: number
          created_at: string
          error_message: string | null
          id: string
          max_attempts: number
          message_sent: string | null
          message_template: string
          n8n_webhook_url: string
          order_id: string | null
          product_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string | null
          whatsapp_number: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          message_sent?: string | null
          message_template: string
          n8n_webhook_url: string
          order_id?: string | null
          product_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          whatsapp_number: string
        }
        Update: {
          attempts?: number
          created_at?: string
          error_message?: string | null
          id?: string
          max_attempts?: number
          message_sent?: string | null
          message_template?: string
          n8n_webhook_url?: string
          order_id?: string | null
          product_id?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      venues_public: {
        Row: {
          accessibility_features: string[] | null
          address: string | null
          capacity: number | null
          city: string | null
          created_at: string | null
          description: string | null
          facilities: string[] | null
          id: string | null
          name: string | null
          parking_available: boolean | null
          state: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          accessibility_features?: string[] | null
          address?: string | null
          capacity?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          facilities?: string[] | null
          id?: string | null
          name?: string | null
          parking_available?: boolean | null
          state?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          accessibility_features?: string[] | null
          address?: string | null
          capacity?: number | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          facilities?: string[] | null
          id?: string | null
          name?: string | null
          parking_available?: boolean | null
          state?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_user_profile: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          email: string
          email_verified: boolean
          full_name: string
          id: string
          is_verified: boolean
          last_login_at: string
          phone_verified: boolean
          role: string
        }[]
      }
      calculate_platform_fee: {
        Args: { amount_cents: number }
        Returns: number
      }
      can_access_payment_info: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { p_action: string; p_limit_per_hour?: number }
        Returns: boolean
      }
      cleanup_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_upload_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_stripe_session: {
        Args: {
          cancel_url?: string
          product_ids: string[]
          success_url?: string
          user_id: string
        }
        Returns: Json
      }
      decrement_likes_count_comment: {
        Args: { comment_id: string }
        Returns: undefined
      }
      decrement_likes_count_post: {
        Args: { post_id: string }
        Returns: undefined
      }
      email_exists_for_login: {
        Args: { p_email: string }
        Returns: boolean
      }
      export_user_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      generate_store_slug: {
        Args: { store_name: string }
        Returns: string
      }
      get_all_public_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          age_restriction: string
          banner_url: string
          category: string
          created_at: string
          description: string
          event_date: string
          event_type: string
          id: string
          is_featured: boolean
          max_capacity: number
          organizer_id: string
          price_from: number
          status: Database["public"]["Enums"]["event_status"]
          terms_and_conditions: string
          ticket_sales_end_date: string
          ticket_sales_start_date: string
          title: string
          updated_at: string
          venue_id: string
        }[]
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_event_contact_info: {
        Args: { event_id: string }
        Returns: {
          contact_email: string
          contact_phone: string
        }[]
      }
      get_event_organizer_contact: {
        Args: { event_id: string }
        Returns: {
          contact_email: string
          contact_phone: string
        }[]
      }
      get_event_public_data: {
        Args: { event_id: string }
        Returns: {
          age_restriction: string
          banner_url: string
          category: string
          created_at: string
          description: string
          event_date: string
          event_type: string
          id: string
          is_featured: boolean
          max_capacity: number
          organizer_id: string
          price_from: number
          status: Database["public"]["Enums"]["event_status"]
          terms_and_conditions: string
          ticket_sales_end_date: string
          ticket_sales_start_date: string
          title: string
          updated_at: string
          venue_id: string
        }[]
      }
      get_my_payment_audit_logs: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          action: string
          audit_timestamp: string
          error_message: string
          id: string
          success: boolean
        }[]
      }
      get_organizer_event_contact_info: {
        Args: { event_id: string }
        Returns: {
          contact_email: string
          contact_phone: string
        }[]
      }
      get_public_event_data: {
        Args: { event_id: string }
        Returns: {
          age_restriction: string
          banner_url: string
          category: string
          created_at: string
          description: string
          event_date: string
          event_type: string
          id: string
          is_featured: boolean
          max_capacity: number
          organizer_id: string
          price_from: number
          status: Database["public"]["Enums"]["event_status"]
          terms_and_conditions: string
          ticket_sales_end_date: string
          ticket_sales_start_date: string
          title: string
          updated_at: string
          venue_id: string
        }[]
      }
      get_public_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          age_restriction: string
          banner_url: string
          category: string
          created_at: string
          description: string
          event_date: string
          event_type: string
          id: string
          is_featured: boolean
          max_capacity: number
          organizer_id: string
          price_from: number
          status: Database["public"]["Enums"]["event_status"]
          terms_and_conditions: string
          ticket_sales_end_date: string
          ticket_sales_start_date: string
          title: string
          updated_at: string
          venue_id: string
        }[]
      }
      get_public_store_data: {
        Args: { store_slug: string }
        Returns: {
          banner_url: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          logo_url: string
          name: string
          slug: string
          theme: Json
        }[]
      }
      get_public_venues_list: {
        Args: Record<PropertyKey, never>
        Returns: {
          accessibility_features: string[]
          address: string
          capacity: number
          city: string
          created_at: string
          description: string
          facilities: string[]
          id: string
          name: string
          parking_available: boolean
          state: string
          updated_at: string
          website_url: string
        }[]
      }
      get_safe_event_data: {
        Args: { event_id: string }
        Returns: {
          age_restriction: string
          banner_url: string
          category: string
          created_at: string
          description: string
          event_date: string
          event_type: string
          id: string
          is_featured: boolean
          max_capacity: number
          organizer_id: string
          price_from: number
          status: Database["public"]["Enums"]["event_status"]
          terms_and_conditions: string
          ticket_sales_end_date: string
          ticket_sales_start_date: string
          title: string
          updated_at: string
          venue_id: string
        }[]
      }
      get_safe_venue_data: {
        Args: { venue_id: string }
        Returns: {
          address: string
          amenities: Json
          capacity: number
          city: string
          country: string
          created_at: string
          id: string
          images: Json
          latitude: number
          longitude: number
          name: string
          postal_code: string
          state: string
          updated_at: string
        }[]
      }
      get_sanitized_event: {
        Args: { event_id: string }
        Returns: {
          age_restriction: string
          banner_url: string
          category: string
          created_at: string
          description: string
          event_date: string
          event_type: string
          id: string
          is_featured: boolean
          max_capacity: number
          organizer_id: string
          price_from: number
          status: Database["public"]["Enums"]["event_status"]
          terms_and_conditions: string
          ticket_sales_end_date: string
          ticket_sales_start_date: string
          title: string
          updated_at: string
          venue_id: string
        }[]
      }
      get_security_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          action: string
          count: number
          latest_occurrence: string
          severity: string
        }[]
      }
      get_store_followers_count: {
        Args: { store_id: string }
        Returns: number
      }
      get_system_config: {
        Args: { p_key: string }
        Returns: Json
      }
      get_user_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          category_id: string
          compare_price_cents: number
          created_at: string
          description: string
          featured: boolean
          id: string
          price_cents: number
          slug: string
          status: string
          store_id: string
          thumbnail_url: string
          title: string
          total_duration_minutes: number
          total_lessons: number
          type: string
          updated_at: string
        }[]
      }
      get_venue_contact_info: {
        Args: { venue_id: string }
        Returns: {
          contact_email: string
          contact_phone: string
        }[]
      }
      get_venue_public_data: {
        Args: { venue_id: string }
        Returns: {
          accessibility_features: string[]
          address: string
          capacity: number
          city: string
          created_at: string
          description: string
          facilities: string[]
          id: string
          name: string
          parking_available: boolean
          state: string
          updated_at: string
          website_url: string
        }[]
      }
      handle_successful_payment: {
        Args: { payment_intent_id?: string; session_id: string }
        Returns: undefined
      }
      increment_comments_count: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_coupon_usage: {
        Args: { coupon_id: string }
        Returns: undefined
      }
      increment_likes_count_comment: {
        Args: { comment_id: string }
        Returns: undefined
      }
      increment_likes_count_post: {
        Args: { post_id: string }
        Returns: undefined
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_name?: string
          p_entity_type: string
        }
        Returns: undefined
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_target_id?: string
          p_target_type?: string
        }
        Returns: undefined
      }
      log_payment_info_access: {
        Args: {
          accessed_user_id: string
          action_type: string
          error_msg?: string
          success_status?: boolean
        }
        Returns: undefined
      }
      log_profile_data_access: {
        Args: {
          p_accessed_profile_id: string
          p_action: string
          p_reason?: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: { p_action: string; p_details?: Json; p_user_id?: string }
        Returns: string
      }
      log_sensitive_access: {
        Args: {
          p_action: string
          p_details?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
      log_sensitive_data_access: {
        Args: {
          p_action: string
          p_record_id?: string
          p_risk_level?: string
          p_table_name: string
        }
        Returns: undefined
      }
      mask_contact_info: {
        Args: { contact_value: string }
        Returns: string
      }
      secure_get_payment_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          bank_account: Json
          created_at: string
          id: string
          pix_key: string
          stripe_account_id: string
          updated_at: string
          verified: boolean
        }[]
      }
      secure_insert_payment_info: {
        Args: {
          p_bank_account?: Json
          p_pix_key?: string
          p_stripe_account_id?: string
        }
        Returns: string
      }
      secure_update_payment_info: {
        Args: {
          p_bank_account?: Json
          p_pix_key?: string
          p_stripe_account_id?: string
        }
        Returns: boolean
      }
      set_first_user_as_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      soft_delete_product: {
        Args: { p_product_id: string }
        Returns: boolean
      }
      update_user_consent: {
        Args: {
          p_data_consent?: boolean
          p_marketing_consent?: boolean
          p_processing_consent?: boolean
        }
        Returns: boolean
      }
      user_can_access_order_item: {
        Args: { item_order_id: string }
        Returns: boolean
      }
      user_follows_store: {
        Args: { store_id: string }
        Returns: boolean
      }
      validate_coupon: {
        Args: {
          p_coupon_code: string
          p_order_total_cents: number
          p_product_ids?: string[]
        }
        Returns: Json
      }
      validate_cpf: {
        Args: { cpf_input: string }
        Returns: boolean
      }
      validate_phone: {
        Args: { phone_input: string }
        Returns: boolean
      }
      validate_phone_br: {
        Args: { phone_input: string }
        Returns: boolean
      }
      verify_code_and_update_profile: {
        Args: { p_code: string; p_type: string }
        Returns: Json
      }
      verify_user_contact: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          phone: string
          whatsapp_number: string
        }[]
      }
    }
    Enums: {
      achievement_type:
        | "video_completion"
        | "course_completion"
        | "login_streak"
        | "community_participation"
        | "content_creation"
      event_status: "draft" | "published" | "cancelled" | "completed"
      notification_type:
        | "new_content"
        | "achievement"
        | "course_update"
        | "community_message"
        | "system_announcement"
      user_role: "client" | "organizer" | "promoter" | "admin"
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
    Enums: {
      achievement_type: [
        "video_completion",
        "course_completion",
        "login_streak",
        "community_participation",
        "content_creation",
      ],
      event_status: ["draft", "published", "cancelled", "completed"],
      notification_type: [
        "new_content",
        "achievement",
        "course_update",
        "community_message",
        "system_announcement",
      ],
      user_role: ["client", "organizer", "promoter", "admin"],
    },
  },
} as const
