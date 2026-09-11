/**
 * Supabase Database Types
 *
 * Generated from the database schema. Run `npm run supabase:types` to regenerate.
 * For local dev: npx supabase gen types typescript --local > src/lib/supabase/types.ts
 * For hosted:    npx supabase gen types typescript --project-id decimal-app > src/lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemberRole =
  | "super_admin"
  | "principal"
  | "teacher"
  | "timetable_manager"
  | "finance"
  | "admissions_officer"
  | "secretary"
  | "parent";

export type SchoolStatus = "active" | "pending" | "suspended";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "paused" | "cancelled" | "expired";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type SchoolType = "private" | "public" | "community";
export type EducationLevel = "primary" | "junior" | "senior" | "junior_senior";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          active_school_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          active_school_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          active_school_id?: string | null;
          updated_at?: string;
        };
      };
      schools: {
        Row: {
          id: string;
          name: string;
          slug: string;
          school_type: SchoolType;
          education_level: EducationLevel;
          phone: string | null;
          email: string | null;
          address: string | null;
          logo_url: string | null;
          status: SchoolStatus;
          subscription_status: SubscriptionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          school_type?: SchoolType;
          education_level?: EducationLevel;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          logo_url?: string | null;
          status?: SchoolStatus;
          subscription_status?: SubscriptionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          school_type?: SchoolType;
          education_level?: EducationLevel;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          logo_url?: string | null;
          status?: SchoolStatus;
          subscription_status?: SubscriptionStatus;
          updated_at?: string;
        };
      };
      school_members: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          role: MemberRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_id: string;
          role: MemberRole;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          school_id?: string;
          role?: MemberRole;
          is_active?: boolean;
        };
      };
      academic_years: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_current?: boolean;
        };
      };
      terms: {
        Row: {
          id: string;
          academic_year_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          academic_year_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          academic_year_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          is_current?: boolean;
        };
      };
      grades: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          level: number;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          level?: number;
        };
      };
      classes: {
        Row: {
          id: string;
          school_id: string;
          grade_id: string;
          name: string;
          capacity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          grade_id: string;
          name: string;
          capacity?: number;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          grade_id?: string;
          name?: string;
          capacity?: number;
        };
      };
      subjects: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          code: string;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          code?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          school_id: string;
          first_name: string;
          last_name: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          first_name: string;
          last_name: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          first_name?: string;
          last_name?: string;
          user_id?: string | null;
        };
      };
      class_teachers: {
        Row: {
          id: string;
          class_id: string;
          teacher_id: string;
          subject_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          teacher_id: string;
          subject_id?: string | null;
          created_at?: string;
        };
        Update: {
          class_id?: string;
          teacher_id?: string;
          subject_id?: string | null;
        };
      };
      students: {
        Row: {
          id: string;
          school_id: string;
          class_id: string;
          first_name: string;
          last_name: string;
          admission_number: string;
          date_of_birth: string | null;
          gender: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id: string;
          first_name: string;
          last_name: string;
          admission_number: string;
          date_of_birth?: string | null;
          gender?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          class_id?: string;
          first_name?: string;
          last_name?: string;
          admission_number?: string;
          date_of_birth?: string | null;
          gender?: string | null;
          is_active?: boolean;
        };
      };
      attendance_records: {
        Row: {
          id: string;
          school_id: string;
          class_id: string;
          student_id: string;
          date: string;
          status: AttendanceStatus;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          class_id: string;
          student_id: string;
          date: string;
          status: AttendanceStatus;
          recorded_by: string;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          class_id?: string;
          student_id?: string;
          date?: string;
          status?: AttendanceStatus;
          recorded_by?: string;
        };
      };
      exams: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          term_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          term_id: string;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          term_id?: string;
        };
      };
      exam_results: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          subject_id: string;
          score: number;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          student_id: string;
          subject_id: string;
          score: number;
          recorded_by: string;
          created_at?: string;
        };
        Update: {
          exam_id?: string;
          student_id?: string;
          subject_id?: string;
          score?: number;
          recorded_by?: string;
        };
      };
      fee_structures: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          amount: number;
          grade_id: string | null;
          term_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          amount: number;
          grade_id?: string | null;
          term_id: string;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          amount?: number;
          grade_id?: string | null;
          term_id?: string;
        };
      };
      student_accounts: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          balance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          balance?: number;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          student_id?: string;
          balance?: number;
        };
      };
      payments: {
        Row: {
          id: string;
          student_account_id: string;
          amount: number;
          payment_method: string;
          reference: string | null;
          recorded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_account_id: string;
          amount: number;
          payment_method: string;
          reference?: string | null;
          recorded_by: string;
          created_at?: string;
        };
        Update: {
          student_account_id?: string;
          amount?: number;
          payment_method?: string;
          reference?: string | null;
          recorded_by?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          school_id: string;
          title: string;
          content: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          title: string;
          content: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          title?: string;
          content?: string;
          created_by?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_id: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          school_id?: string;
          title?: string;
          message?: string;
          read?: boolean;
        };
      };
      permissions: {
        Row: {
          id: string;
          resource: string;
          action: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource: string;
          action: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          resource?: string;
          action?: string;
          description?: string | null;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role: MemberRole;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          role: MemberRole;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role?: MemberRole;
          permission_id?: string;
        };
      };
      custom_roles: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      custom_role_assignments: {
        Row: {
          id: string;
          school_member_id: string;
          custom_role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_member_id: string;
          custom_role_id: string;
          created_at?: string;
        };
        Update: {
          school_member_id?: string;
          custom_role_id?: string;
        };
      };
      custom_role_permissions: {
        Row: {
          id: string;
          custom_role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          custom_role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          custom_role_id?: string;
          permission_id?: string;
        };
      };
      domain_events: {
        Row: {
          id: string;
          event_type: string;
          school_id: string | null;
          actor_user_id: string | null;
          resource_type: string;
          resource_id: string | null;
          payload: Json;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          school_id?: string | null;
          actor_user_id?: string | null;
          resource_type: string;
          resource_id?: string | null;
          payload?: Json;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          event_type?: string;
          school_id?: string | null;
          actor_user_id?: string | null;
          resource_type?: string;
          resource_id?: string | null;
          payload?: Json;
          metadata?: Json;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          school_id: string | null;
          actor_user_id: string | null;
          actor_email: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id?: string | null;
          actor_user_id?: string | null;
          actor_email?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          school_id?: string | null;
          actor_user_id?: string | null;
          actor_email?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      feature_flags: {
        Row: {
          id: string;
          key: string;
          name: string;
          description: string | null;
          is_enabled: boolean;
          scope: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          description?: string | null;
          is_enabled?: boolean;
          scope?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          name?: string;
          description?: string | null;
          is_enabled?: boolean;
          scope?: string;
          updated_at?: string;
        };
      };
      school_feature_flags: {
        Row: {
          id: string;
          school_id: string;
          feature_flag_id: string;
          is_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          feature_flag_id: string;
          is_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          feature_flag_id?: string;
          is_enabled?: boolean;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price_monthly: number;
          currency: string;
          max_students: number;
          max_staff: number;
          features: Json;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price_monthly?: number;
          currency?: string;
          max_students?: number;
          max_staff?: number;
          features?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          price_monthly?: number;
          currency?: string;
          max_students?: number;
          max_staff?: number;
          features?: Json;
          is_active?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          school_id: string;
          plan_id: string;
          status: string;
          provider: string | null;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          plan_id: string;
          status?: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          school_id?: string;
          plan_id?: string;
          status?: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_end?: string | null;
          updated_at?: string;
        };
      };
      subscription_events: {
        Row: {
          id: string;
          subscription_id: string;
          provider: string;
          provider_event_id: string;
          event_type: string;
          payload: Json;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          provider: string;
          provider_event_id: string;
          event_type: string;
          payload?: Json;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          subscription_id?: string;
          provider?: string;
          provider_event_id?: string;
          event_type?: string;
          payload?: Json;
          processed_at?: string | null;
        };
      };
      billing_invoices: {
        Row: {
          id: string;
          subscription_id: string;
          school_id: string;
          amount: number;
          currency: string;
          status: string;
          billing_reason: string | null;
          provider_invoice_id: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          school_id: string;
          amount: number;
          currency?: string;
          status?: string;
          billing_reason?: string | null;
          provider_invoice_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          subscription_id?: string;
          school_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          billing_reason?: string | null;
          provider_invoice_id?: string | null;
          paid_at?: string | null;
        };
      };
      fee_categories: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
        };
      };
      invoices: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          fee_structure_id: string;
          invoice_number: string;
          amount_due: number;
          amount_paid: number;
          discount: number;
          balance: number;
          status: string;
          due_date: string | null;
          term_id: string | null;
          academic_year_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          fee_structure_id: string;
          invoice_number: string;
          amount_due: number;
          amount_paid?: number;
          discount?: number;
          status?: string;
          due_date?: string | null;
          term_id?: string | null;
          academic_year_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          school_id?: string;
          student_id?: string;
          fee_structure_id?: string;
          invoice_number?: string;
          amount_due?: number;
          amount_paid?: number;
          discount?: number;
          status?: string;
          due_date?: string | null;
          term_id?: string | null;
          academic_year_id?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      ledger_entries: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          invoice_id: string | null;
          payment_id: string | null;
          entry_type: string;
          amount: number;
          balance_after: number;
          description: string | null;
          reference: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          invoice_id?: string | null;
          payment_id?: string | null;
          entry_type: string;
          amount: number;
          balance_after: number;
          description?: string | null;
          reference?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          student_id?: string;
          invoice_id?: string | null;
          payment_id?: string | null;
          entry_type?: string;
          amount?: number;
          balance_after?: number;
          description?: string | null;
          reference?: string | null;
          created_by?: string | null;
        };
      };
      receipts: {
        Row: {
          id: string;
          school_id: string;
          receipt_number: string;
          payment_id: string;
          invoice_id: string | null;
          student_id: string;
          amount: number;
          payment_method: string | null;
          reference: string | null;
          issued_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          receipt_number: string;
          payment_id: string;
          invoice_id?: string | null;
          student_id: string;
          amount: number;
          payment_method?: string | null;
          reference?: string | null;
          issued_at?: string;
        };
        Update: {
          school_id?: string;
          receipt_number?: string;
          payment_id?: string;
          invoice_id?: string | null;
          student_id?: string;
          amount?: number;
          payment_method?: string | null;
          reference?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          school_id: string;
          title: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          title?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          title?: string | null;
          created_by?: string | null;
        };
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          last_read_at: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          last_read_at?: string | null;
          joined_at?: string;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
          last_read_at?: string | null;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          channel: string;
          event_type: string;
          is_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_id: string;
          channel: string;
          event_type: string;
          is_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          school_id?: string;
          channel?: string;
          event_type?: string;
          is_enabled?: boolean;
        };
      };
      notification_templates: {
        Row: {
          id: string;
          school_id: string | null;
          event_type: string;
          channel: string;
          subject_template: string | null;
          body_template: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id?: string | null;
          event_type: string;
          channel: string;
          subject_template?: string | null;
          body_template: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          school_id?: string | null;
          event_type?: string;
          channel?: string;
          subject_template?: string | null;
          body_template?: string;
          is_active?: boolean;
        };
      };
      parent_student_relationships: {
        Row: {
          id: string;
          parent_user_id: string;
          student_id: string;
          relationship_type: string;
          is_primary: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_user_id: string;
          student_id: string;
          relationship_type?: string;
          is_primary?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          parent_user_id?: string;
          student_id?: string;
          relationship_type?: string;
          is_primary?: boolean;
          is_active?: boolean;
        };
      };
      report_cards: {
        Row: {
          id: string;
          school_id: string;
          student_id: string;
          exam_id: string;
          class_id: string;
          academic_year_id: string;
          term_id: string;
          total_score: number;
          average_score: number;
          class_rank: number | null;
          class_size: number | null;
          overall_grade: string | null;
          remarks: string | null;
          generated_at: string;
          generated_by: string | null;
        };
        Insert: {
          id?: string;
          school_id: string;
          student_id: string;
          exam_id: string;
          class_id: string;
          academic_year_id: string;
          term_id: string;
          total_score?: number;
          average_score?: number;
          class_rank?: number | null;
          class_size?: number | null;
          overall_grade?: string | null;
          remarks?: string | null;
          generated_at?: string;
          generated_by?: string | null;
        };
        Update: {
          school_id?: string;
          student_id?: string;
          exam_id?: string;
          class_id?: string;
          academic_year_id?: string;
          term_id?: string;
          total_score?: number;
          average_score?: number;
          class_rank?: number | null;
          class_size?: number | null;
          overall_grade?: string | null;
          remarks?: string | null;
          generated_by?: string | null;
        };
      };
      analytics_snapshots: {
        Row: {
          id: string;
          school_id: string;
          snapshot_type: string;
          period_start: string;
          period_end: string;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          snapshot_type: string;
          period_start: string;
          period_end: string;
          data?: Json;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          snapshot_type?: string;
          period_start?: string;
          period_end?: string;
          data?: Json;
        };
      };
      document_categories: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          description?: string | null;
          is_active?: boolean;
        };
      };
      documents: {
        Row: {
          id: string;
          school_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string | null;
          is_public: boolean;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          file_name: string;
          file_path: string;
          file_size?: number;
          mime_type: string;
          uploaded_by?: string | null;
          is_public?: boolean;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          school_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          uploaded_by?: string | null;
          is_public?: boolean;
          download_count?: number;
          updated_at?: string;
        };
      };
      document_access: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          can_view: boolean;
          can_download: boolean;
          granted_at: string;
          granted_by: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          can_view?: boolean;
          can_download?: boolean;
          granted_at?: string;
          granted_by?: string | null;
        };
        Update: {
          document_id?: string;
          user_id?: string;
          can_view?: boolean;
          can_download?: boolean;
          granted_by?: string | null;
        };
      };
      api_keys: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes: string[];
          rate_limit: number;
          is_active: boolean;
          last_used_at: string | null;
          expires_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes?: string[];
          rate_limit?: number;
          is_active?: boolean;
          last_used_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          scopes?: string[];
          rate_limit?: number;
          is_active?: boolean;
          last_used_at?: string | null;
          expires_at?: string | null;
          created_by?: string | null;
        };
      };
      webhook_endpoints: {
        Row: {
          id: string;
          school_id: string;
          url: string;
          secret: string;
          events: string[];
          is_active: boolean;
          last_triggered_at: string | null;
          failure_count: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          school_id: string;
          url: string;
          secret: string;
          events?: string[];
          is_active?: boolean;
          last_triggered_at?: string | null;
          failure_count?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          school_id?: string;
          url?: string;
          secret?: string;
          events?: string[];
          is_active?: boolean;
          last_triggered_at?: string | null;
          failure_count?: number;
          created_by?: string | null;
        };
      };
      webhook_deliveries: {
        Row: {
          id: string;
          endpoint_id: string;
          event_type: string;
          payload: Json;
          status: string;
          response_status: number | null;
          response_body: string | null;
          attempts: number;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          endpoint_id: string;
          event_type: string;
          payload?: Json;
          status?: string;
          response_status?: number | null;
          response_body?: string | null;
          attempts?: number;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          endpoint_id?: string;
          event_type?: string;
          payload?: Json;
          status?: string;
          response_status?: number | null;
          response_body?: string | null;
          attempts?: number;
          delivered_at?: string | null;
        };
      };
      api_usage_logs: {
        Row: {
          id: string;
          api_key_id: string;
          method: string;
          path: string;
          status_code: number | null;
          response_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          api_key_id: string;
          method: string;
          path: string;
          status_code?: number | null;
          response_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          api_key_id?: string;
          method?: string;
          path?: string;
          status_code?: number | null;
          response_time_ms?: number | null;
        };
      };
      system_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          category: string;
          is_public: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: Json;
          description?: string | null;
          category?: string;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          category?: string;
          is_public?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      platform_analytics: {
        Row: {
          id: string;
          metric_type: string;
          metric_value: number;
          dimensions: Json;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          metric_type: string;
          metric_value: number;
          dimensions?: Json;
          recorded_at?: string;
        };
        Update: {
          metric_type?: string;
          metric_value?: number;
          dimensions?: Json;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_user_school_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      has_permission: {
        Args: {
          p_user_id: string;
          p_school_id: string;
          p_resource: string;
          p_action: string;
        };
        Returns: boolean;
      };
      get_user_permissions: {
        Args: {
          p_user_id: string;
          p_school_id: string;
        };
        Returns: string[];
      };
    };
    Enums: {
      member_role: MemberRole;
      school_status: SchoolStatus;
      subscription_status: SubscriptionStatus;
      attendance_status: AttendanceStatus;
    };
  };
}
