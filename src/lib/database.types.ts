export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      access_grants: {
        Row: {
          created_at: string
          doctor_id: string
          expires_at: string
          grant_type: string
          id: string
          patient_id: string
          reason: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          expires_at: string
          grant_type?: string
          id?: string
          patient_id: string
          reason: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          expires_at?: string
          grant_type?: string
          id?: string
          patient_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_access_grants_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_access_grants_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      access_requests: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          email: string
          hospital_department_id: string | null
          id: string
          name: string | null
          national_id_no: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          hospital_department_id?: string | null
          id: string
          name?: string | null
          national_id_no?: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          hospital_department_id?: string | null
          id?: string
          name?: string | null
          national_id_no?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "accounts_hospital_department_id_fkey"
            columns: ["hospital_department_id"]
            isOneToOne: false
            referencedRelation: "hospital_departments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          date: string
          department_id: string | null
          diagnosis: string | null
          doctor_id: string
          doctor_notes: string | null
          final_diagnosis: string | null
          hospital_id: string | null
          id: string
          initial_symptoms: string | null
          reason: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          department_id?: string | null
          diagnosis?: string | null
          doctor_id: string
          doctor_notes?: string | null
          final_diagnosis?: string | null
          hospital_id?: string | null
          id?: string
          initial_symptoms?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          department_id?: string | null
          diagnosis?: string | null
          doctor_id?: string
          doctor_notes?: string | null
          final_diagnosis?: string | null
          hospital_id?: string | null
          id?: string
          initial_symptoms?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "hospital_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          severity: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hospital_departments: {
        Row: {
          hospital_id: string
          id: string
          name: string
        }
        Insert: {
          hospital_id: string
          id?: string
          name: string
        }
        Update: {
          hospital_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_departments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          certificate_pem: string | null
          city: string | null
          contact_number: string
          created_at: string
          district: string | null
          email: string
          encrypted_private_key: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          province: string | null
          public_key: string | null
        }
        Insert: {
          certificate_pem?: string | null
          city?: string | null
          contact_number: string
          created_at?: string
          district?: string | null
          email: string
          encrypted_private_key?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          province?: string | null
          public_key?: string | null
        }
        Update: {
          certificate_pem?: string | null
          city?: string | null
          contact_number?: string
          created_at?: string
          district?: string | null
          email?: string
          encrypted_private_key?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          province?: string | null
          public_key?: string | null
        }
        Relationships: []
      }
      lab_report_items: {
        Row: {
          id: string
          is_abnormal: boolean | null
          lab_report_id: string
          normal_range: string | null
          result: string
          test_name: string
          unit: string | null
        }
        Insert: {
          id?: string
          is_abnormal?: boolean | null
          lab_report_id: string
          normal_range?: string | null
          result: string
          test_name: string
          unit?: string | null
        }
        Update: {
          id?: string
          is_abnormal?: boolean | null
          lab_report_id?: string
          normal_range?: string | null
          result?: string
          test_name?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_report_items_lab_report_id_fkey"
            columns: ["lab_report_id"]
            isOneToOne: false
            referencedRelation: "lab_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_reports: {
        Row: {
          appointment_id: string
          checked_by: string | null
          created_at: string
          created_by: string
          file_url: string | null
          id: string
          notes: string | null
          report_date: string
          report_hash: string | null
          report_name: string
          report_type: Database["public"]["Enums"]["lab_report_type"]
          signature: string | null
          signer_hospital_id: string | null
        }
        Insert: {
          appointment_id: string
          checked_by?: string | null
          created_at?: string
          created_by: string
          file_url?: string | null
          id?: string
          notes?: string | null
          report_date?: string
          report_hash?: string | null
          report_name: string
          report_type: Database["public"]["Enums"]["lab_report_type"]
          signature?: string | null
          signer_hospital_id?: string | null
        }
        Update: {
          appointment_id?: string
          checked_by?: string | null
          created_at?: string
          created_by?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          report_date?: string
          report_hash?: string | null
          report_name?: string
          report_type?: Database["public"]["Enums"]["lab_report_type"]
          signature?: string | null
          signer_hospital_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_reports_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_reports_signer_hospital_id_fkey"
            columns: ["signer_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          appointment_id: string
          created_at: string
          dosage: string
          duration: string | null
          frequency: string
          id: string
          medicine_name: string
          notes: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string
          dosage: string
          duration?: string | null
          frequency: string
          id?: string
          medicine_name: string
          notes?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string
          dosage?: string
          duration?: string | null
          frequency?: string
          id?: string
          medicine_name?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      system_keys: {
        Row: {
          created_at: string
          encrypted_private_key: string
          id: string
          key_type: string
          public_key: string
        }
        Insert: {
          created_at?: string
          encrypted_private_key: string
          id?: string
          key_type: string
          public_key: string
        }
        Update: {
          created_at?: string
          encrypted_private_key?: string
          id?: string
          key_type?: string
          public_key?: string
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
      appointment_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "deleted"
      lab_report_type:
        | "blood_test"
        | "urine_test"
        | "xray"
        | "ct_scan"
        | "mri"
        | "ultrasound"
        | "other"
      user_role: "citizen" | "provider" | "ministry" | "doctor"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appointment_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "deleted",
      ],
      lab_report_type: [
        "blood_test",
        "urine_test",
        "xray",
        "ct_scan",
        "mri",
        "ultrasound",
        "other",
      ],
      user_role: ["citizen", "provider", "ministry", "doctor"],
    },
  },
} as const

