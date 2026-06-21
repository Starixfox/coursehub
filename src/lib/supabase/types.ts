// Generated from the live CourseHub Supabase schema (project ddkujivsfnqvnhubzjjy).
// Regenerate with: supabase gen types typescript --project-id <ref> --schema public
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          id: string;
          ip: string | null;
          metadata: Json;
          target_id: string | null;
          target_type: string | null;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          ip?: string | null;
          metadata?: Json;
          target_id?: string | null;
          target_type?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
        Relationships: [];
      };
      certificates: {
        Row: {
          course_id: string;
          id: string;
          issued_at: string;
          serial: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          id?: string;
          issued_at?: string;
          serial: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Insert"]>;
        Relationships: [];
      };
      courses: {
        Row: {
          category: string | null;
          created_at: string;
          creator_id: string;
          creator_name: string | null;
          description: string | null;
          id: string;
          level: string | null;
          published_at: string | null;
          required_tier: Database["public"]["Enums"]["subscription_tier"];
          slug: string;
          status: Database["public"]["Enums"]["course_status"];
          subtitle: string | null;
          thumbnail_path: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          creator_id: string;
          creator_name?: string | null;
          description?: string | null;
          id?: string;
          level?: string | null;
          published_at?: string | null;
          required_tier?: Database["public"]["Enums"]["subscription_tier"];
          slug: string;
          status?: Database["public"]["Enums"]["course_status"];
          subtitle?: string | null;
          thumbnail_path?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [];
      };
      enrollments: {
        Row: {
          course_id: string;
          created_at: string;
          id: string;
          last_accessed_at: string;
          user_id: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          id?: string;
          last_accessed_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["enrollments"]["Insert"]>;
        Relationships: [];
      };
      lesson_content: {
        Row: {
          cf_stream_uid: string | null;
          content_html: string | null;
          content_json: Json | null;
          created_at: string;
          lesson_id: string;
          updated_at: string;
        };
        Insert: {
          cf_stream_uid?: string | null;
          content_html?: string | null;
          content_json?: Json | null;
          created_at?: string;
          lesson_id: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_content"]["Insert"]>;
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          completed: boolean;
          completed_at: string | null;
          course_id: string;
          created_at: string;
          id: string;
          last_position_seconds: number;
          lesson_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          completed_at?: string | null;
          course_id: string;
          created_at?: string;
          id?: string;
          last_position_seconds?: number;
          lesson_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Insert"]>;
        Relationships: [];
      };
      lessons: {
        Row: {
          course_id: string;
          created_at: string;
          duration_seconds: number;
          has_video: boolean;
          id: string;
          is_preview: boolean;
          module_id: string;
          position: number;
          required_tier: Database["public"]["Enums"]["subscription_tier"] | null;
          slug: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          duration_seconds?: number;
          has_video?: boolean;
          id?: string;
          is_preview?: boolean;
          module_id: string;
          position?: number;
          required_tier?: Database["public"]["Enums"]["subscription_tier"] | null;
          slug?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
        Relationships: [];
      };
      modules: {
        Row: {
          course_id: string;
          created_at: string;
          id: string;
          position: number;
          title: string;
        };
        Insert: {
          course_id: string;
          created_at?: string;
          id?: string;
          position?: number;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      stripe_events: {
        Row: { id: string; payload: Json | null; processed_at: string; type: string };
        Insert: { id: string; payload?: Json | null; processed_at?: string; type: string };
        Update: Partial<Database["public"]["Tables"]["stripe_events"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          billing_interval: Database["public"]["Enums"]["billing_interval"] | null;
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string | null;
          id: string;
          seats: number;
          status: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tier: Database["public"]["Enums"]["subscription_tier"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          billing_interval?: Database["public"]["Enums"]["billing_interval"] | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          seats?: number;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: Database["public"]["Enums"]["subscription_tier"];
          updated_at?: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      can_i_access_lesson: { Args: { p_lesson_id: string }; Returns: boolean };
      claim_certificate: {
        Args: { p_course_id: string };
        Returns: Database["public"]["Tables"]["certificates"]["Row"];
      };
      my_course_progress: {
        Args: { p_course_id: string };
        Returns: { total: number; completed: number; percent: number }[];
      };
      my_current_tier: {
        Args: Record<string, never>;
        Returns: Database["public"]["Enums"]["subscription_tier"];
      };
    };
    Enums: {
      billing_interval: "month" | "year";
      course_status: "draft" | "published" | "archived";
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "unpaid"
        | "paused";
      subscription_tier: "free" | "basic" | "pro" | "premium";
      user_role: "admin" | "creator" | "subscriber";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
