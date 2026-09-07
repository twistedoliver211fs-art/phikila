/**
 * Supabase Database Types
 *
 * Generated from the database schema. Run `npm run supabase:types` to regenerate.
 * For local dev: npx supabase gen types typescript --local > src/lib/supabase/types.ts
 * For hosted:    npx supabase gen types typescript --project-id phikila-app > src/lib/supabase/types.ts
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
export type SubscriptionStatus = "trial" | "active" | "expired" | "cancelled";
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
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
          staff_id: string;
          subject_id: string | null;
        };
        Insert: {
          id?: string;
          class_id: string;
          staff_id: string;
          subject_id?: string | null;
        };
        Update: {
          class_id?: string;
          staff_id?: string;
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
    };
    Views: Record<string, never>;
    Functions: {
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_user_school_ids: {
        Args: Record<string, never>;
        Returns: string;
      };
      has_school_role: {
        Args: { p_school_id: string; p_roles: MemberRole[] };
        Returns: boolean;
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
