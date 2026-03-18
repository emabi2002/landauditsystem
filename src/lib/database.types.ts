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
      audit_divisions: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          head_position: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          head_position?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          head_position?: string | null
          created_at?: string
        }
      }
      audit_sections: {
        Row: {
          id: string
          division_id: string
          code: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          division_id: string
          code: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          division_id?: string
          code?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      groups: {
        Row: {
          id: string
          group_name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          module_name: string
          module_key: string
          description: string | null
          category: string | null
          icon: string | null
          route: string | null
          created_at: string
        }
        Insert: {
          id?: string
          module_name: string
          module_key: string
          description?: string | null
          category?: string | null
          icon?: string | null
          route?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          module_name?: string
          module_key?: string
          description?: string | null
          category?: string | null
          icon?: string | null
          route?: string | null
          created_at?: string
        }
      }
      group_module_permissions: {
        Row: {
          id: string
          group_id: string
          module_id: string
          can_create: boolean
          can_read: boolean
          can_update: boolean
          can_delete: boolean
          can_print: boolean
          can_approve: boolean
          can_export: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          module_id: string
          can_create?: boolean
          can_read?: boolean
          can_update?: boolean
          can_delete?: boolean
          can_print?: boolean
          can_approve?: boolean
          can_export?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          module_id?: string
          can_create?: boolean
          can_read?: boolean
          can_update?: boolean
          can_delete?: boolean
          can_print?: boolean
          can_approve?: boolean
          can_export?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_groups: {
        Row: {
          id: string
          user_id: string
          group_id: string
          assigned_at: string
          assigned_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          assigned_at?: string
          assigned_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          assigned_at?: string
          assigned_by?: string | null
        }
      }
      audit_users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          division_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          division_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          division_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          module_id: string | null
          action: string
          record_id: string | null
          record_type: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          logged_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          module_id?: string | null
          action: string
          record_id?: string | null
          record_type?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          logged_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          module_id?: string | null
          action?: string
          record_id?: string | null
          record_type?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          logged_at?: string
        }
      }
      // Risk Register tables
      audit_risk_register: {
        Row: {
          id: string
          risk_id: string
          risk_title: string
          risk_description: string | null
          risk_category: string | null
          risk_owner_division_id: string | null
          inherent_likelihood: number | null
          inherent_impact: number | null
          inherent_risk_score: number | null
          inherent_risk_level: string | null
          control_effectiveness: string | null
          residual_likelihood: number | null
          residual_impact: number | null
          residual_risk_score: number | null
          residual_risk_level: string | null
          risk_status: string
          last_reviewed_at: string | null
          next_review_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_id: string
          risk_title: string
          risk_description?: string | null
          risk_category?: string | null
          risk_owner_division_id?: string | null
          inherent_likelihood?: number | null
          inherent_impact?: number | null
          inherent_risk_score?: number | null
          inherent_risk_level?: string | null
          control_effectiveness?: string | null
          residual_likelihood?: number | null
          residual_impact?: number | null
          residual_risk_score?: number | null
          residual_risk_level?: string | null
          risk_status?: string
          last_reviewed_at?: string | null
          next_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_id?: string
          risk_title?: string
          risk_description?: string | null
          risk_category?: string | null
          risk_owner_division_id?: string | null
          inherent_likelihood?: number | null
          inherent_impact?: number | null
          inherent_risk_score?: number | null
          inherent_risk_level?: string | null
          control_effectiveness?: string | null
          residual_likelihood?: number | null
          residual_impact?: number | null
          residual_risk_score?: number | null
          residual_risk_level?: string | null
          risk_status?: string
          last_reviewed_at?: string | null
          next_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Risk Events table
      audit_risk_events: {
        Row: {
          id: string
          event_number: string
          risk_register_id: string | null
          event_title: string
          event_description: string | null
          event_type: string
          event_source: string
          source_reference: string | null
          priority_level: string
          event_status: string
          requested_by: string | null
          date_received: string | null
          allocated_to_id: string | null
          allocated_at: string | null
          target_completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_number?: string
          risk_register_id?: string | null
          event_title: string
          event_description?: string | null
          event_type: string
          event_source: string
          source_reference?: string | null
          priority_level?: string
          event_status?: string
          requested_by?: string | null
          date_received?: string | null
          allocated_to_id?: string | null
          allocated_at?: string | null
          target_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_number?: string
          risk_register_id?: string | null
          event_title?: string
          event_description?: string | null
          event_type?: string
          event_source?: string
          source_reference?: string | null
          priority_level?: string
          event_status?: string
          requested_by?: string | null
          date_received?: string | null
          allocated_to_id?: string | null
          allocated_at?: string | null
          target_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Engagements table
      audit_engagements: {
        Row: {
          id: string
          engagement_number: string
          risk_event_id: string | null
          engagement_title: string
          engagement_type: string
          scope: string | null
          objectives: string | null
          lead_auditor_id: string | null
          status: string
          planned_start_date: string | null
          planned_end_date: string | null
          actual_start_date: string | null
          actual_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engagement_number?: string
          risk_event_id?: string | null
          engagement_title: string
          engagement_type: string
          scope?: string | null
          objectives?: string | null
          lead_auditor_id?: string | null
          status?: string
          planned_start_date?: string | null
          planned_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engagement_number?: string
          risk_event_id?: string | null
          engagement_title?: string
          engagement_type?: string
          scope?: string | null
          objectives?: string | null
          lead_auditor_id?: string | null
          status?: string
          planned_start_date?: string | null
          planned_end_date?: string | null
          actual_start_date?: string | null
          actual_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Findings table
      audit_findings: {
        Row: {
          id: string
          engagement_id: string
          finding_number: string
          finding_title: string
          condition: string | null
          criteria: string | null
          cause: string | null
          effect: string | null
          risk_rating: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          engagement_id: string
          finding_number?: string
          finding_title: string
          condition?: string | null
          criteria?: string | null
          cause?: string | null
          effect?: string | null
          risk_rating?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          engagement_id?: string
          finding_number?: string
          finding_title?: string
          condition?: string | null
          criteria?: string | null
          cause?: string | null
          effect?: string | null
          risk_rating?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Recommendations table
      audit_recommendations: {
        Row: {
          id: string
          finding_id: string
          recommendation_number: string
          recommendation_text: string
          priority: string
          responsible_division_id: string | null
          target_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          finding_id: string
          recommendation_number?: string
          recommendation_text: string
          priority?: string
          responsible_division_id?: string | null
          target_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          finding_id?: string
          recommendation_number?: string
          recommendation_text?: string
          priority?: string
          responsible_division_id?: string | null
          target_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
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
